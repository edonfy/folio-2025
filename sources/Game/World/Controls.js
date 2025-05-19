import { Game } from '../Game.js'
import { InteractiveAreas } from '../InteractiveAreas.js'

export class Controls
{
    constructor(references)
    {
        this.game = Game.getInstance()
        
        this.references = references

        this.setInteractiveArea()
    }

    setInteractiveArea()
    {
        this.game.interactiveAreas.create(
            this.references.get('interactiveArea')[0].position,
            'Controls',
            InteractiveAreas.ALIGN_RIGHT,
            () =>
            {
                this.game.modals.open('controls')
            }
        )
    }
}