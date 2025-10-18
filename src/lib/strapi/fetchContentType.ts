import { draftMode } from "next/headers";
import qs from "qs";
/**
 * Fetches data for a specified Strapi content type.
 *
 * @param {string} contentType - The type of content to fetch from Strapi.
 * @param {string} params - Query parameters to append to the API request.
 * @return {Promise<object>} The fetched data.
 */

interface StrapiData {
  id: number;
  [key: string]: any; // Allow for any additional fields
}

interface StrapiResponse {
  data: StrapiData | StrapiData[];
}

export function spreadStrapiData(data: StrapiResponse): StrapiData | null {
  if (Array.isArray(data.data) && data.data.length > 0) {
    return data.data[0];
  }
  if (!Array.isArray(data.data)) {
    return data.data;
  }
  return null
}

export default async function fetchContentType(
  contentType: string,
  params: Record<string, unknown> = {},
  spreadData?: boolean,
  skipDraftMode?: boolean,
): Promise<any> {
  let isEnabled = false;
  
  // Only check draftMode if not skipped (e.g., during static generation)
  if (!skipDraftMode) {
    try {
      const draft = await draftMode();
      isEnabled = draft.isEnabled;
    } catch (error) {
      // If draftMode fails (e.g., during generateStaticParams), just continue without it
      isEnabled = false;
    }
  }

  try {

    const queryParams = { ...params };

    if (isEnabled) {
      queryParams.status = "draft";
    }

    // Construct the full URL for the API request
    const url = new URL(`api/${contentType}`, process.env.NEXT_PUBLIC_API_URL);

    // Perform the fetch request with the provided query parameters
    const response = await fetch(`${url.href}?${qs.stringify(queryParams)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from Strapi (url=${url.toString()}, status=${response.status})`);
    }
    const jsonData: StrapiResponse = await response.json();
    return spreadData ? spreadStrapiData(jsonData) : jsonData;
  } catch (error) {
    // Log any errors that occur during the fetch process
    console.error('FetchContentTypeError', error);
  }
}
