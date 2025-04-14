import { Game } from '../Game.js'
import { InteractiveAreas } from '../InteractiveAreas2.js'

export class Intro
{
    constructor(interactiveAreaPosition)
    {
        this.game = Game.getInstance()
        
        this.interactiveAreaPosition = interactiveAreaPosition

        this.setInteractiveArea()
    }

    setInteractiveArea()
    {
        this.game.interactiveAreas.create(
            this.interactiveAreaPosition,
            'Read me!',
            InteractiveAreas.ALIGN_RIGHT,
            () =>
            {
                this.game.modals.open('intro')
            }
        )
    }
}