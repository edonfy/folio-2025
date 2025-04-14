import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { InstancedGroup } from '../InstancedGroup.js'

export class Easter
{
    constructor()
    {
        this.game = Game.getInstance()

        this.setVisual()


        // References
        const references = InstancedGroup.getReferencesFromChildren(this.game.resources.easterEggReferencesModel.scene.children)
        console.log(references)
        
        for(const reference of references)
        {
        }

        // this.game.entities.add(
        //     {
        //         model: model,
        //         parent: null
        //     },
        //     null
        // )
        // // model.removeFromParent()

        // Instanced group
        this.testInstancedGroup = new InstancedGroup(references, this.visual, true)
    }

    setVisual()
    {
        // Material
        const material = new THREE.MeshBasicNodeMaterial()

        // Model
        const model = this.game.resources.easterEggVisualModel.scene.children[0]
        model.position.set(0, 3, 0)
        model.rotation.set(0, 0, 0)
        model.frustumCulled = false
        model.material = material

        

        this.visual = model
    }
}

