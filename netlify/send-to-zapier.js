const ZAPIER_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/16836879/uj1jl58/';
const CLOZE_API_KEY  = 'Rbeeq8-TT48QkVCbIIwEOf-cdX2-NFWLjB-S0-bQPwGE';
const CLOZE_USER     = 'toncoffeng@makelaarsvan.nl';

exports.handler = async (event) => {
      if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
      let payload;
      try { payload = JSON.parse(event.body); }
      catch(e) { return { statusCode: 400, body: 'Invalid JSON' }; }
      const results = {};

      // Wilma: Google Sheet via Zapier
      if (payload.makelaar === 'Wilma Out') {
              try {
                        const zr = await fetch(ZAPIER_WEBHOOK, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(payload)
                        });
                        results.zapier = zr.status;
              } catch(e) { results.zapier_error = e.message; }
      }

      // Alle anderen: Cloze contact aanmaken (flat body, Bearer token)
      if (payload.makelaar !== 'Wilma Out') {
              try {
                        const desc = [
                                    'Type: ' + (payload.type_opdracht || ''),
                                    'Status: ' + (payload.status || ''),
                                    'Fee: EUR' + (payload.fee || ''),
                                    'Bron: ' + (payload.bron || ''),
                                    'Makelaar: ' + (payload.makelaar || ''),
                                    'Notities: ' + (payload.notities || ''),
                                    'Datum: ' + (payload.datum || '')
                                  ].join(' | ');

                const personData = { description: desc };
                        if (payload.voornaam) personData.name = [payload.voornaam, payload.tussenvoegsel, payload.achternaam].filter(Boolean).join(' ');
                        if (payload.email) personData.emails = [{ value: payload.email, work: true }];
                        if (payload.telefoon) personData.phones = [{ value: payload.telefoon, mobile: true }];

                const url = 'https://api.cloze.com/v1/people/create?user=' + encodeURIComponent(CLOZE_USER) + '&api_key=' + CLOZE_API_KEY;
                        const cr = await fetch(url, {
                                    method: 'POST',
                                    headers: {
                                                  'Content-Type': 'application/json',
                                                  'Authorization': 'Bearer ' + CLOZE_API_KEY
                                    },
                                    body: JSON.stringify(personData)
                        });
                        const cdata = await cr.json();
                        results.cloze = cr.status;
                        results.cloze_errorcode = cdata.errorcode;
                        results.cloze_message = cdata.message;
                        results.cloze_id = cdata.id || null;
              } catch(e) { results.cloze_error = e.message; }
      }

      return { statusCode: 200, body: JSON.stringify({ ok: true, results }) };
};
