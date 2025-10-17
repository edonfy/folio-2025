import * as THREE from 'three/webgpu'
import { color, uniform, vec2 } from 'three/tsl'
import { Game } from './Game.js'
import gsap from 'gsap'

export class Reveal
{
    constructor()
    {
        this.game = Game.getInstance()
        
        this.center = uniform(vec2(3, 1.8))
        this.distance = uniform(0)
        this.thickness = uniform(0.05)
        this.color = uniform(color('#e88eff'))
        this.intensity = uniform(10)

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '📜 Reveal',
                expanded: true,
            })

            this.debugPanel.addButton({ title: 'expose' }).on('click', () => { this.expose() })
            this.debugPanel.addBinding(this.distance, 'value', { label: 'distance', min: 0, max: 20, step: 0.01 })
            this.debugPanel.addBinding(this.thickness, 'value', { label: 'thickness', min: 0, max: 1, step: 0.001 })
            // this.game.debug.addThreeColorBinding(this.debugPanel, this.color.value, 'color')
            this.debugPanel.addBinding(this.intensity, 'value', { label: 'intensity', min: 1, max: 20, step: 0.001 })
        }

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 9)
    }

    expose(center = null)
    {
        // Center
        const _center = center instanceof THREE.Vector2 ? center : new THREE.Vector2(this.game.player.position.x, this.game.player.position.z)
        this.center.value.copy(_center)

        // Distance
        this.distance.value = 0
        
        gsap.to(
            this.distance,
            {
                value: 9,
                ease: 'power3.out',
                duration: 3,
                onComplete: () =>
                {
                    gsap.to(
                        this.distance,
                        {
                            value: 30,
                            ease: 'back.in(2)',
                            duration: 1.5,
                            onComplete: () =>
                            {
                                this.distance.value = 99999
                            }
                        }
                    )

                    // gsap.delayedCall(0.75, () =>
                    // {
                        // Inputs filters
                        this.game.inputs.filters.clear()
                        this.game.inputs.filters.add('wandering')
                    // })
                }
            }
        )

        // View
        this.game.view.zoom.smoothedRatio = 0.6
        this.game.view.zoom.baseRatio = 0.6

        gsap.to(
            this.game.view.zoom,
            {
                baseRatio: 0.3,
                // smoothedRatio: 0.4,
                ease: 'power3.out',
                duration: 3,
                onComplete: () =>
                {
                    gsap.to(
                        this.game.view.zoom,
                        {
                            baseRatio: 0,
                            // smoothedRatio: 0,
                            ease: 'back.in(1.5)',
                            duration: 1.5,
                        }
                    )
                }
            }
        )
        // this.game.view.zoom.baseRatio
    }

    update()
    {
        this.color.value.copy(this.game.dayCycles.properties.revealColor.value)
        this.intensity.value = this.game.dayCycles.properties.revealIntensity.value
    }
}