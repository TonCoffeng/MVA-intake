exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  try {
    const res = await fetch('https://hooks.zapier.com/hooks/catch/16836879/uj1jl58/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body
    });
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
