import * as THREE from 'three'
import { color, positionWorld, uniform, vec2 } from 'three/tsl'
import { Game } from './Game.js'

export class Fog
{
    constructor()
    {
        this.game = Game.getInstance()
        
        this.color = uniform(color('#00f4ff'))
        this.game.scene.backgroundNode = this.color

        this.fogNear = uniform(6)
        this.fogFar = uniform(45)
        this.fogOffset = uniform(vec2(0, 0))
        this.fogColor = this.color
        this.fogStrength = positionWorld.xz.sub(this.fogOffset).length().smoothstep(this.fogNear, this.fogFar)

        this.game.time.events.on('tick', () =>
        {
            this.update()
        }, 9)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '☁️ Fog',
                expanded: true,
            })

            debugPanel.addBinding({ color: this.color.value.getHex(THREE.SRGBColorSpace) }, 'color', { view: 'color' })
                .on('change', tweak => { this.color.value.set(tweak.value) })
            debugPanel.addBinding(this.fogNear, 'value', { label: 'near', min: 0, max: 100, step: 0.01 })
            debugPanel.addBinding(this.fogFar, 'value', { label: 'far', min: 0, max: 100, step: 0.01 })
        }
    }

    update()
    {
        this.fogOffset.value.set(this.game.view.focusPoint.position.x, this.game.view.focusPoint.position.z)
    }
}