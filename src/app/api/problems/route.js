import problems from '@/data/problems.json';

export async function GET(request) {
    return new Response(JSON.stringify(problems), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
}
