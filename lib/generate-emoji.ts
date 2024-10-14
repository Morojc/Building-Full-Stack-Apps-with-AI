import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateEmoji(prompt: string) {
  try {
    const output = await replicate.run(
      "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
      {
        input: {
          prompt: prompt,
          num_outputs: 1,
        },
      }
    );

    if (Array.isArray(output) && output.length > 0) {
      const imageUrl = output[0];
      return { success: true, imageUrl };
    } else {
      return { success: false, error: "Failed to generate emoji" };
    }
  } catch (error) {
    console.error("Error generating emoji:", error);
    return { success: false, error: "Internal server error" };
  }
}
