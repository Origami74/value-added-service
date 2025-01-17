import { NRelay1, NPool, NSecSigner} from '@nostrify/nostrify';

const privateKey = Deno.env.get("NOSTR_PRIVATE_KEY")
const relays = Deno.env.get("NOSTR_RELAYS")?.split(",");

if(!privateKey){
    throw new Error("Required env var: NOSTR_PRIVATE_KEY");
}

if(!relays){
    throw new Error("Required env var: NOSTR_RELAYS (comma seperated)");
}

const nostrNow = (): number => Math.floor(Date.now() / 1000);

const pool = new NPool({
    open(url) {
        return new NRelay1(url);
    },
    reqRouter: async (filters) => {
        return new Map(relays.map((relay) => {
            return [relay, filters];
        }));
    },
    eventRouter: async event => {
        return relays;
    },
});

await Deno.cron("Value-Added Service", {dayOfWeek: {every: 1}}, async () => {
    await greet()
});

async function greet(){
    let message = "GM nostr:npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6"

    let dayOfWeek = new Date().getDay()

    if(dayOfWeek == 6 || dayOfWeek == 7){
        message = "GFY nostr:npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6"
    }

    const signer = new NSecSigner(privateKey);
    const signerPubkey = await signer.getPublicKey();

    var note = {
        kind: 1,
        pubkey: signerPubkey,
        content: message,
        created_at: nostrNow(),
        tags: [
            ["p", "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d"]
        ]
    }
    const envt = await signer.signEvent(note);

    await pool.event(envt)
}

