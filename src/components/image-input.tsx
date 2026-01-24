"use client";

import { ImageIcon } from "lucide-react";
import { useState } from "react";

export function ImageInput() {
	const [fileName, setFileName] = useState<string | null>(null);

	return (
		<div className="grid gap-2">
			<label
				className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-slate-300 border-dashed bg-slate-50 hover:bg-slate-100"
				htmlFor="image"
			>
				<ImageIcon className="mb-2 h-8 w-8 text-slate-400" />
				<p className="text-slate-600 text-sm">
					{fileName ?? "Click to upload photo"}
				</p>
			</label>

			<input
				accept="image/*"
				className="hidden"
				id="image"
				name="image"
				onChange={(e) => {
					const file = e.target.files?.[0];
					setFileName(file ? file.name : null);
				}}
				type="file"
			/>
		</div>
	);
}
