import { useState } from "react";

export default function CheckedItem({itemLabel}: {itemLabel:string}) {
    const [isChecked, setIsChecked] = useState(false);
    
    return (
        <div 
            className="flex gap-2"
            onClick={() => setIsChecked(!isChecked)}
        >
            <input 
                type="checkbox"
                checked={isChecked}
                onChange={()=>{}} 
            />
            {
                isChecked ?
                <p className="line-through text-gray-500">{itemLabel}</p> :
                <p>{itemLabel}</p>
            }
        </div>
    )
}

