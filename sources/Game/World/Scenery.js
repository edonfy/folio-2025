import { Game } from '../Game.js'

export class Scenery
{
    constructor()
    {
        this.game = Game.getInstance()

        this.game.materials.updateObject(this.game.resources.sceneryVisualModel.scene)
        this.game.resources.sceneryVisualModel.scene.traverse(_child =>
        {
            if(_child.isMesh)
            {
                _child.castShadow = true
                _child.receiveShadow = true
            }
        })

        this.game.scene.add(this.game.resources.sceneryVisualModel.scene)
    }
}