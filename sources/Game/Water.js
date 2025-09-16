import { uniform } from 'three/tsl'
import { Game } from './Game.js'

export class Water
{
    constructor()
    {
        this.game = Game.getInstance()

        this.elevation = -0.3

        this.elevationUniform = uniform(this.elevation)
        this.amplitudeUniform = uniform(0.013)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '💧 Water',
                expanded: false,
            })
            debugPanel.addBinding(this.elevationUniform, 'value', { label: 'elevation', min: -1, max: 0, step: 0.001 })
            debugPanel.addBinding(this.amplitudeUniform, 'value', { label: 'amplitude', min: 0, max: 0.5, step: 0.001 })
        }
    }
}