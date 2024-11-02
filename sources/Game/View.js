import * as THREE from 'three'
import CameraControls from 'camera-controls'
import { Game } from './Game.js'

CameraControls.install( { THREE: THREE } )

export class View
{
    constructor()
    {
        this.game = new Game()

        this.mode = 'default'

        this.spherical = new THREE.Spherical(25, Math.PI * 0.35, Math.PI * 0.25)
        this.target = new THREE.Vector3()
        this.smoothedTarget = new THREE.Vector3()
        this.offset = new THREE.Vector3().setFromSpherical(this.spherical)

        this.camera = new THREE.PerspectiveCamera(25, this.game.viewport.ratio, 0.1, 1000)
        this.game.world.scene.add(this.camera)

        this.cameraControls = new CameraControls(this.camera, this.game.domElement)
        this.cameraControls.enabled = this.mode === 'controls'
        this.cameraControls.smoothTime = 0.075
        this.cameraControls.draggingSmoothTime = 0.075
        this.cameraControls.dollySpeed = 0.2

        this.game.time.events.on('tick', () =>
        {
            this.update()
        }, 3)

        this.game.viewport.events.on('change', () =>
        {
            this.resize()
        })

        if(this.game.debug.active)
        {
            const folder = this.game.debug.panel.addFolder({
                title: '📷 View',
                expanded: true,
            })

            folder.addBinding(
                this,
                'mode',
                {
                    options:
                    {
                        default: 'default',
                        controls: 'controls',
                    }
                }
            ).on('change', () => 
            {
                this.smoothedTarget.copy(this.target)

                this.cameraControls.enabled = this.mode === 'controls'
                this.cameraControls.setTarget(this.target.x, this.target.y, this.target.z)
                this.cameraControls.setPosition(this.camera.position.x, this.camera.position.y, this.camera.position.z)
            })
            folder.addBinding(this.spherical, 'phi', { min: 0, max: Math.PI * 0.5, step: 0.001 }).on('change', () => this.offset.setFromSpherical(this.spherical) )
            folder.addBinding(this.spherical, 'theta', { min: - Math.PI, max: Math.PI, step: 0.001 }).on('change', () => this.offset.setFromSpherical(this.spherical) )
            folder.addBinding(this.spherical, 'radius', { min: 0, max: 100, step: 0.001 }).on('change', () => this.offset.setFromSpherical(this.spherical) )
        }
    }

    resize()
    {
        this.camera.aspect = this.game.viewport.width / this.game.viewport.height
        this.camera.updateProjectionMatrix()
    }

    update()
    {
        if(this.mode === 'default')
        {
            this.smoothedTarget.lerp(this.target, this.game.time.delta * 10)
            this.camera.position.copy(this.smoothedTarget).add(this.offset)
            this.camera.lookAt(this.smoothedTarget)
        }
        else
        {
            this.cameraControls.update(this.game.time.delta)
        }
    }
}