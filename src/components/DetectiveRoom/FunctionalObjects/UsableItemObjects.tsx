import {ANCHOR} from "@/components/Game/anchors";
import Magnifier from "@/components/Models/Functional/Magnifier";
import {magnifierMaterials} from "@/components/Materials/detectiveRoomMats";
import React from "react";

export function UsableItemObjects() {

    return (
        <>
            <group userData={{ pickupId: 'magnifier', anchorKey: 'magnifier1'}}>
                <Magnifier
                    position={ANCHOR.magnifier1.position}
                    rotation={ANCHOR.magnifier1.rotation}
                    materialsById={magnifierMaterials}
                    disableOutline
                    inspectDisableOutline
                />
            </group>
        </>
    )
}