import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { Readable } from 'stream';

// Ensure the API token is set
if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN is not set in the environment variables');
}

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
    try {
        // Parse the incoming request JSON
        const { prompt } = await request.json();
        console.log("Received prompt:", prompt);

        if (!prompt) {
            throw new Error('Prompt is required');
        }

        const model = "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e";
        const input = {
            prompt: `A TOK emoji of ${prompt}`,
            width: 1024,
            height: 1024,
            refine: "no_refiner",
            scheduler: "K_EULER",
            lora_scale: 0.6,
            num_outputs: 1,
            guidance_scale: 7.5,
            apply_watermark: false,
            high_noise_frac: 0.8,
            negative_prompt: "",
            prompt_strength: 0.8,
            num_inference_steps: 50,
        };

        console.log('Using model: %s', model);
        console.log('With input: %O', input);

        console.log('Running...');
        const output = await replicate.run(model, { input });
        // Create a readable stream from the output
        const stream = Readable.from(output);
        let result = '';
        // Process the stream
        for await (const chunk of stream) {
            result += chunk
            console.log('Received chunk:', chunk)
        }

        console.log('Done! Full output:', result)
        // Assuming the result is a URL string
        /* if (typeof result === 'string' && result.startsWith('http')) {
           console.log("Generated Image URL:", result);
           return NextResponse.json({ success: true, imageUrl: result });
         } else {
           console.error('Invalid image URL format:', result);
           throw new Error('Invalid image URL format');
         }*/

        return NextResponse.json({ success: true, imageUrl: result });

    } catch (error) {
        console.error('Error generating emoji:', error);
        return NextResponse.json(
            { success: false, error: 'Error generating emoji', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
