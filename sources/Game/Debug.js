import { Pane } from 'tweakpane'
import { Game } from './Game.js'

export class Debug
{
    constructor()
    {
        this.game = Game.getInstance()
        
        this.active = location.hash.indexOf('debug') !== -1

        if(this.active)
            this.panel = new Pane()
    }
}