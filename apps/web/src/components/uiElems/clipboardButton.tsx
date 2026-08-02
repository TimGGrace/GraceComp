import {useClipboard} from "@reactuses/core";
interface ClipboardProps {
    toCopy: string,
    className?: string
}

export default function ClipboardButton({props}:{props:ClipboardProps}) {
    const [, copy] = useClipboard();

    if (props.className){
        return (
            <button className={props.className} onClick={() => copy(props.toCopy)}>📎 Copy</button>
        )
    }

    return (
        <button onClick={() => copy(props.toCopy)}>📎 Copy</button>
    )
    
}