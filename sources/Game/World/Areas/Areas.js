import { Game } from '../../Game.js'
import { AltarArea } from './AltarArea.js'
import { CookieArea } from './CookieArea.js'
import { BonfireArea } from './BonfireArea.js'
import { IntroArea } from './IntroArea.js'
import { ControlsArea } from './ControlsArea.js'
import { ProjectsArea } from './ProjectsArea.js'
import { LabArea } from './LabArea.js'
import { CareerArea } from './CareerArea.js'
import { SocialArea } from './SocialArea.js'
import { ToiletArea } from './ToiletArea.js'
import { BowlingArea } from './BowlingArea.js'
import { CircuitArea } from './CircuitArea.js'
import { BehindTheSceneArea } from './BehindTheSceneArea.js'
import { AchievementsArea } from './AchievementsArea.js'

export class Areas
{
    constructor()
    {
        this.game = Game.getInstance()

        this.setReferences()
        this.setObjects()

        const achievementsReferences = this.references.getStartingWith('achievements')
        if(achievementsReferences.size)
            this.achievements = new AchievementsArea(achievementsReferences)

        const behindTheSceneReferences = this.references.getStartingWith('behindTheScene')
        if(behindTheSceneReferences.size)
            this.behindTheScene = new BehindTheSceneArea(behindTheSceneReferences)

        const toiletReferences = this.references.getStartingWith('toilet')
        if(toiletReferences.size)
            this.toilet = new ToiletArea(toiletReferences)

        const careerReferences = this.references.getStartingWith('career')
        if(careerReferences.size)
            this.career = new CareerArea(careerReferences)

        const socialReferences = this.references.getStartingWith('social')
        if(socialReferences.size)
            this.social = new SocialArea(socialReferences)

        const labReferences = this.references.getStartingWith('lab')
        if(labReferences.size)
            this.lab = new LabArea(labReferences)
        
        const projectsReferences = this.references.getStartingWith('projects')
        if(projectsReferences.size)
            this.projects = new ProjectsArea(projectsReferences)
        
        const altarReferences = this.references.getStartingWith('altar')
        if(altarReferences.size)
            this.altar = new AltarArea(altarReferences)

        const cookieReferences = this.references.getStartingWith('cookie')
        if(cookieReferences.size)
            this.cookie = new CookieArea(cookieReferences)
            
        const bonfireReferences = this.references.getStartingWith('bonfire')
        if(bonfireReferences.size)
            this.poleLights = new BonfireArea(bonfireReferences)
            
        const introReferences = this.references.getStartingWith('intro')
        if(introReferences.size)
            this.intro = new IntroArea(introReferences)

        const controlsReferences = this.references.getStartingWith('controls')
        if(controlsReferences.size)
            this.controls = new ControlsArea(controlsReferences)

        const bowlingReferences = this.references.getStartingWith('bowling')
        if(bowlingReferences.size)
            this.bowling = new BowlingArea(bowlingReferences)

        const circuitReferences = this.references.getStartingWith('circuit')
        if(circuitReferences.size)
            this.circuit = new CircuitArea(circuitReferences)
    }

    setReferences()
    {
        this.references = {}

        this.references.items = new Map()

        this.references.parse = (object) =>
        {
            object.traverse(_child =>
            {
                const name = _child.name

                // Anything starting with "reference"
                const matches = name.match(/^ref(?:erence)?([^0-9]+)([0-9]+)?$/)
                if(matches)
                {
                    // Extract name without "reference" and without number at the end
                    const referenceName = matches[1].charAt(0).toLowerCase() + matches[1].slice(1)
                    
                    // Create / save in array
                    if(!this.references.items.has(referenceName))
                        this.references.items.set(referenceName, [_child])
                    else
                        this.references.items.get(referenceName).push(_child)
                }
            })
        }

        this.references.getStartingWith = (searched) =>
        {
            const items = new Map()

            this.references.items.forEach((value, name) =>
            {
                if(name.startsWith(searched))
                {
                    // Strip name from searched value
                    let stripName = name.replace(new RegExp(`^${searched}(.+)$`), '$1')
                    stripName = stripName.charAt(0).toLowerCase() + stripName.slice(1)

                    items.set(stripName, value)
                }
            })

            return items
        }
    }

    setObjects()
    {
        const model = [...this.game.resources.areasModel.scene.children]
        for(const child of model)
        {
            // Add
            if(typeof child.userData.prevent === 'undefined' || child.userData.prevent === false)
            {
                // Objects
                this.game.objects.addFromModel(
                    child,
                    {

                    },
                    {
                        // friction: child.userData.friction ?? 0.5,
                        // restitution: 1,
                        position: child.position,
                        rotation: child.quaternion,
                        sleeping: true,
                        mass: child.userData.mass,
                        // collidersOverwrite:
                        // {
                        //     mass: child.userData.mass ?? 1
                        // }
                    }
                )
            }

            // Parse references
            this.references.parse(child)
        }
    }
}