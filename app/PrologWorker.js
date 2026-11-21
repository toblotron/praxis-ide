// Code that runs Trealla Prolog inside a Web Worker.
//
// Running Prolog in a worker means a runaway query (endless loop, very deep
// recursion) can always be stopped: the IDE simply terminates the worker when
// the time limit runs out, and starts a fresh one. Trealla itself cannot do this
// in the browser - call_with_time_limit/2 and friends are missing from its WASM
// build, and trealla-js has no way to interrupt a query that is running.
//
// prologWorkerMain is never called in the page. index.html turns its source into
// a Blob URL and starts the worker from that, which works both when Praxis is
// served from a web server and when index.html is opened from the file system.
function prologWorkerMain(treallaUrl) {
    let T = null;   // the trealla-js module
    let pl = null;  // the Prolog engine
    const queries = new Map(); // query id -> trealla-js query generator

    // Same answer format as Praxis used before the worker: Prolog toplevel text.
    class Toplevel {
        constructor(id) {
            this.id = id;
            this.dec = new TextDecoder();
        }
        query(_, goal, bind) {
            return T.FORMATS.prolog.query(null, goal, bind);
        }
        parse(pl, status, stdout, stderr, options) {
            return {
                '$format': 'custom',
                id: this.id,
                status,
                stdout: T.FORMATS.prolog.parse(pl, status, stdout, stderr, options),
                stderr: this.dec.decode(stderr)
            };
        }
        truth(pl, status, stderr, options) {
            return { '$format': 'custom', id: this.id, status, stdout: status ? "true" : "false", stderr: this.dec.decode(stderr) };
        }
    }

    function formatAnswer(result) {
        if (typeof result === "string")
            return "   " + result;
        if ('$format' in result)
            return result.stderr.trim() + (result.stderr ? "\n" : "") + "   " + result.stdout.trim();
        return T.toJSON(result, " ") + "\n";
    }

    async function nextAnswer(qid) {
        const q = queries.get(qid);
        if (!q)
            return { done: true };
        const { value } = await q.next();
        if (!value) {
            queries.delete(qid);
            return { done: true };
        }
        return { done: false, text: formatAnswer(value) };
    }

    const handlers = {
        async init() {
            T = await import(treallaUrl);
            await T.load();
            pl = new T.Prolog();
        },
        async writeFile({ path, text }) {
            pl.fs.open(path, { write: true, create: true }).writeString(text);
        },
        async consult({ path }) {
            await pl.consult(path);
        },
        async query({ qid, goal, program }) {
            // only one query is active at a time - drop any earlier ones (they are idle,
            // waiting for "next", so return() stops them right away)
            for (const [id, q] of queries) {
                queries.delete(id);
                await q.return();
            }
            const q = pl.query(goal, { program: program || undefined, format: new Toplevel(qid), encode: { dot: false } });
            queries.set(qid, q);
            return nextAnswer(qid);
        },
        async next({ qid }) {
            return nextAnswer(qid);
        }
    };

    // Handle messages strictly one at a time, in the order they arrive.
    let chain = Promise.resolve();
    self.onmessage = (event) => {
        const { id, type, payload } = event.data;
        chain = chain.then(async () => {
            try {
                const result = await handlers[type](payload || {});
                self.postMessage({ id, ok: true, result });
            } catch (err) {
                self.postMessage({ id, ok: false, error: String((err && err.message) || err) });
            }
        });
    };
}
