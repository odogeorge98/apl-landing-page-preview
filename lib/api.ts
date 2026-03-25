import { config } from "@/lib/config";

export interface WaitlistData {
  email: string;
  name: string;
}

export interface WaitlistResponse {
  success: boolean;
  message?: string;
}

export async function addToWaitlist(data: WaitlistData): Promise<WaitlistResponse> {
  try {
    const response = await fetch(`${config.api.baseUrl}/add-to-waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        name: data.name,
      }),
    });

    const result = await response.json();

    // Check if the response contains an error
    if (result.error) {
      throw new Error(result.error);
    }

    // Check if the response is not ok (HTTP error)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      message: result.message || 'Successfully joined the waitlist!',
    };
  } catch (error) {
    console.error('Failed to add to waitlist:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to join waitlist. Please try again.'
    );
  }
}