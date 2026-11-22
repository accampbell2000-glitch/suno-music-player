"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type QueueItem = {
	id: string;
	name: string;
	originalSize: number;
	originalUrl: string;
	from: "webp" | "jpg";
	to: "jpg" | "webp";
	status: "queued" | "converting" | "done" | "error";
	resultUrl?: string;
	resultSize?: number;
	error?: string;
	width?: number;
	height?: number;
};

function detectFormat(file: File): "webp" | "jpg" | null {
	const name = file.name.toLowerCase();
	if (file.type === "image/webp" || name.endsWith(".webp")) return "webp";
	if (
		file.type === "image/jpeg" ||
		name.endsWith(".jpg") ||
		name.endsWith(".jpeg")
	)
		return "jpg";
	return null;
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function baseName(name: string): string {
	return name.replace(/\.[^.]+$/, "") || "converted";
}

export function WebpToJpgConverter() {
	const [items, setItems] = useState<QueueItem[]>([]);
	const [quality, setQuality] = useState(92);
	const [dragOver, setDragOver] = useState(false);
	const [notice, setNotice] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const busyRef = useRef(false);

	const convertItem = useCallback(
		async (item: QueueItem, q: number, file: File): Promise<void> => {
			setItems((prev) =>
				prev.map((i) => (i.id === item.id ? { ...i, status: "converting" } : i)),
			);
			try {
				const bitmap = await createImageBitmap(file);
				const canvas = document.createElement("canvas");
				canvas.width = bitmap.width;
				canvas.height = bitmap.height;
				const ctx = canvas.getContext("2d");
				if (!ctx) throw new Error("canvas failed");
				// JPG has no transparency; WebP keeps it, so only fill white for JPG.
				if (item.to === "jpg") {
					ctx.fillStyle = "#ffffff";
					ctx.fillRect(0, 0, canvas.width, canvas.height);
				}
				ctx.drawImage(bitmap, 0, 0);
				const width = bitmap.width;
				const height = bitmap.height;
				bitmap.close();
				const mime = item.to === "webp" ? "image/webp" : "image/jpeg";
				const blob = await new Promise<Blob | null>((resolve) =>
					canvas.toBlob(resolve, mime, q / 100),
				);
				if (!blob) throw new Error("convert failed");
				const url = URL.createObjectURL(blob);
				setItems((prev) =>
					prev.map((i) =>
						i.id === item.id
							? {
									...i,
									status: "done",
									resultUrl: url,
									resultSize: blob.size,
									width,
									height,
								}
							: i,
					),
				);
				setNotice("");
			} catch {
				setItems((prev) =>
					prev.map((i) =>
						i.id === item.id
							? {
									...i,
									status: "error",
									error:
										`Could not convert this file. It may not be a valid ${item.from === "webp" ? "WebP" : "JPG"} image.`,
								}
							: i,
					),
				);
			}
		},
		[],
	);

	const addFiles = useCallback(
		(files: FileList | File[]) => {
			const list = Array.from(files);
			const newly: QueueItem[] = [];
			const errors: string[] = [];
			const plainFiles: File[] = [];
			for (const file of list) {
				const from = detectFormat(file);
				if (!from) {
					errors.push(file.name);
					continue;
				}
				if (file.size > 25 * 1024 * 1024) {
					errors.push(`${file.name} (over 25 MB)`);
					continue;
				}
				plainFiles.push(file);
				newly.push({
					id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
					name: file.name,
					originalSize: file.size,
					originalUrl: URL.createObjectURL(file),
					from,
					to: from === "webp" ? "jpg" : "webp",
					status: "queued",
				});
			}
			if (errors.length) {
				setNotice(
					`Skipped: ${errors.join(", ")}. Add .webp and .jpg/.jpeg files only.`,
				);
			} else if (newly.length) {
				setNotice("");
			}
			if (newly.length) {
				setItems((prev) => {
					const next = [...prev, ...newly];
					void (async () => {
						if (busyRef.current) return;
						busyRef.current = true;
						try {
							for (let i = 0; i < newly.length; i++) {
								// eslint-disable-next-line no-await-in-loop
								await convertItem(newly[i], quality, plainFiles[i]);
							}
						} finally {
							busyRef.current = false;
						}
					})();
					return next;
				});
			}
		},
		[convertItem, quality],
	);

	// Revoke object URLs on unmount
	useEffect(() => {
		const snapshot = items;
		return () => {
			for (const i of snapshot) {
				URL.revokeObjectURL(i.originalUrl);
				if (i.resultUrl) URL.revokeObjectURL(i.resultUrl);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const removeItem = (id: string) => {
		setItems((prev) => {
			const target = prev.find((i) => i.id === id);
			if (target) {
				URL.revokeObjectURL(target.originalUrl);
				if (target.resultUrl) URL.revokeObjectURL(target.resultUrl);
			}
			return prev.filter((i) => i.id !== id);
		});
	};

	const clearAll = () => {
		for (const i of items) {
			URL.revokeObjectURL(i.originalUrl);
			if (i.resultUrl) URL.revokeObjectURL(i.resultUrl);
		}
		setItems([]);
		setNotice("");
	};

	const doneCount = items.filter((i) => i.status === "done").length;

	return (
		<div className="cf-converter" id="converter">
			<div
				className={`cf-dropzone${dragOver ? " is-over" : ""}`}
				onDragOver={(e) => {
					e.preventDefault();
					setDragOver(true);
				}}
				onDragLeave={() => setDragOver(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDragOver(false);
					if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
				}}
			>
				<p className="cf-kicker">Free, private, instant</p>
				<h2>Convert WebP ⇄ JPG</h2>
				<p>
					Drop WebP or JPG images here. Each file converts to the other
					format in your browser and never leaves your device. No sign-up,
					no watermark, up to 25 MB per image.
				</p>
				<input
					ref={inputRef}
					type="file"
					accept=".webp,.jpg,.jpeg,image/webp,image/jpeg"
					multiple
					hidden
					onChange={(e) => {
						if (e.target.files?.length) addFiles(e.target.files);
						e.target.value = "";
					}}
				/>
				<button
					type="button"
					className="cf-add-row"
					onClick={() => inputRef.current?.click()}
				>
					Choose WebP or JPG images
				</button>
				<div className="cf-quality-wrap">
					<label htmlFor="jpg-quality">Output quality: {quality}</label>
					<input
						id="jpg-quality"
						type="range"
						min={60}
						max={100}
						value={quality}
						onChange={(e) => setQuality(Number(e.target.value))}
					/>
					<small>
						92 looks sharp for most photos. 100 is largest. New files use the
						setting when added.
					</small>
				</div>
				{notice && (
					<p className="cf-action-notice" role="status">
						{notice}
					</p>
				)}
			</div>

			{items.length > 0 && (
				<div className="cf-convert-list">
					<div className="cf-convert-head">
						<p>
							{items.length} file{items.length === 1 ? "" : "s"}
							{doneCount > 0 && ` · ${doneCount} converted`}
						</p>
						<button type="button" onClick={clearAll}>
							Clear all
						</button>
					</div>
					{items.map((item) => (
						<article className="cf-convert-item" key={item.id}>
							<div className="cf-convert-previews">
								<figure>
									<img
										src={item.originalUrl}
										alt={`Original ${item.name}`}
										width={120}
										height={120}
									/>
									<figcaption>
										<strong>{item.name}</strong>
										<span>
										{item.from === "webp" ? "WebP" : "JPG"} ·{" "}
										{formatBytes(item.originalSize)}
									</span>
									</figcaption>
								</figure>
								<span aria-hidden="true">→</span>
								<figure>
									{item.resultUrl ? (
										<img
											src={item.resultUrl}
											alt={`Converted ${item.to === "webp" ? "WebP" : "JPG"} of ${item.name}`}
											width={120}
											height={120}
										/>
									) : (
										<span className="cf-convert-placeholder">
											{item.status === "converting"
												? "Converting…"
												: item.status === "error"
													? "Failed"
													: "Waiting"}
										</span>
									)}
									<figcaption>
										<strong>
											{baseName(item.name)}.
											{item.to}
										</strong>
										<span>
											{item.resultSize
												? `${item.to === "webp" ? "WebP" : "JPG"} · ${formatBytes(item.resultSize)}${item.width ? ` · ${item.width}×${item.height}` : ""}`
												: item.error ??
													(item.to === "webp" ? "WebP" : "JPG")}
										</span>
									</figcaption>
								</figure>
							</div>
							<div className="cf-convert-actions">
								{item.resultUrl && (
									<a
										href={item.resultUrl}
										download={`${baseName(item.name)}.${item.to}`}
										className="cf-add-row"
									>
										Download {item.to === "webp" ? "WebP" : "JPG"}
									</a>
								)}
								<button type="button" onClick={() => removeItem(item.id)}>
									Remove
								</button>
							</div>
							{item.error && (
								<p className="cf-scan-error" role="alert">
									{item.error}
								</p>
							)}
						</article>
					))}
					<p className="cf-privacy-note">
						Private by design: conversion happens locally in your browser.
						Nothing is uploaded, stored, or tracked.
					</p>
				</div>
			)}
		</div>
	);
}
