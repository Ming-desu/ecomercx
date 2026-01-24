const AUTH_URL = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
const BUCKET_NAME = "ecomercx-bucket";

async function authorizeB2() {
	const auth = Buffer.from(
		`${process.env.B2_ACCESS_KEY_ID}:${process.env.B2_SECRET_ACCESS_KEY}`,
	).toString("base64");

	const res = await fetch(AUTH_URL, {
		headers: { Authorization: `Basic ${auth}` },
		// Cache authorization for a short period if needed,
		// but for now, we'll fetch fresh to ensure tokens are valid.
		cache: "no-store",
	});

	if (!res.ok) {
		throw new Error(await res.text());
	}

	return res.json();
}

async function getUploadUrl(apiUrl: string, token: string, bucketId: string) {
	const res = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
		method: "POST",
		headers: { Authorization: token },
		body: JSON.stringify({ bucketId }),
	});

	if (!res.ok) {
		throw new Error(await res.text());
	}

	return res.json();
}

export async function uploadImageToB2(file: File): Promise<string> {
	const authData = await authorizeB2();

	const bucketId = authData.allowed?.bucketId;
	if (!bucketId) {
		throw new Error("Key must be restricted to a bucket");
	}

	const uploadData = await getUploadUrl(
		authData.apiUrl,
		authData.authorizationToken,
		bucketId,
	);

	const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
	const buffer = Buffer.from(await file.arrayBuffer());

	const res = await fetch(uploadData.uploadUrl, {
		method: "POST",
		headers: {
			Authorization: uploadData.authorizationToken,
			"X-Bz-File-Name": encodeURIComponent(fileName),
			"Content-Type": file.type || "b2/x-auto",
			"X-Bz-Content-Sha1": "do_not_verify",
		},
		body: buffer,
	});

	if (!res.ok) {
		throw new Error(await res.text());
	}

	return fileName;
}

/**
 * Generates a signed URL for a private B2 bucket.
 * This must be called from a Server Component or Server Action.
 */
export async function getImageUrl(fileName: string | null) {
	if (!fileName) return null;

	try {
		const authData = await authorizeB2();

		// Request a download authorization token for this specific file
		const res = await fetch(
			`${authData.apiUrl}/b2api/v2/b2_get_download_authorization`,
			{
				method: "POST",
				headers: { Authorization: authData.authorizationToken },
				body: JSON.stringify({
					bucketId: authData.allowed.bucketId,
					fileNamePrefix: fileName,
					validDurationInSeconds: 3600, // Token valid for 1 hour
				}),
			},
		);

		if (!res.ok) {
			throw new Error(await res.text());
		}

		const { authorizationToken } = await res.json();

		// Construct the final private URL
		// Format: <downloadUrl>/file/<bucketName>/<fileName>?Authorization=<token>
		return `${authData.downloadUrl}/file/${BUCKET_NAME}/${fileName}?Authorization=${authorizationToken}`;
	} catch (error) {
		console.error("B2 Download Authorization Error:", error);
		return null;
	}
}
