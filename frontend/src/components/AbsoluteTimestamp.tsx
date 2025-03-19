import * as luxon from "luxon";

export type AbsoluteTimestampProps = {
    timestampISO: string | undefined;
} & React.HTMLAttributes<"span">;

export function AbsoluteTimestamp(props: AbsoluteTimestampProps) {
    if (props.timestampISO) {
        const luxonDT = luxon.DateTime.fromISO(props.timestampISO);

        return <span className={props.className}>
            {luxonDT.toLocaleString(luxon.DateTime.DATETIME_MED)}
        </span>;
    } else {
        return <span className={props.className}></span>;
    }
}