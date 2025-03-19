import * as luxon from "luxon";
import { useEffect, useState } from "react";

export type RelativeTimestampProps = {
    timestampISO: string | undefined;
} & React.HTMLAttributes<"p">;

function formatTimestamp(timestampISO: string | undefined): string {
    if (timestampISO !== undefined) {
        const luxonDT = luxon.DateTime.fromISO(timestampISO);
        const secondsAgo = luxonDT.diffNow(["seconds"]);

        if (secondsAgo.seconds < -(24 * 60 * 60)) {
            return `${Math.round(-secondsAgo.seconds / (24 * 60 * 60))}d`;
        } else if (secondsAgo.seconds < -(60 * 60)) {
            return `${Math.round(-secondsAgo.seconds / (60 * 60))}h`;
        } else if (secondsAgo.seconds < -60) {
            return `${Math.round(-secondsAgo.seconds / 60)}m`;
        } else {
            return `${Math.round(-secondsAgo.seconds)}s`;
        }
    } else {
        return "";
    }
}

export function RelativeTimestamp(props: RelativeTimestampProps) {
    const [text, setText] = useState(formatTimestamp(props.timestampISO));

    useEffect(() => { 
        const timer = setInterval(() => setText(formatTimestamp(props.timestampISO)), 5000);

        return () => clearInterval(timer);
    });

    return <p className={props.className}>
        {formatTimestamp(props.timestampISO)}
    </p>;
}