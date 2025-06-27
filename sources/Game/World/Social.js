import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { InteractiveAreas } from '../InteractiveAreas.js'

export class Social
{
    constructor(references)
    {
        this.game = Game.getInstance()

        this.references = references
        this.center = this.references.get('center')[0].position

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '👨‍🦲 Bruno',
                expanded: false,
            })
        }

        this.setLinks()
    }

    setLinks()
    {
        const links = [
            { name: 'X', url: 'https://x.com/bruno_simon', align: InteractiveAreas.ALIGN_RIGHT },
            { name: 'Bluesky', url: 'https://bsky.app/profile/bruno-simon.bsky.social', align: InteractiveAreas.ALIGN_RIGHT },
            { name: 'Youtube', url: 'https://www.youtube.com/@BrunoSimon', align: InteractiveAreas.ALIGN_RIGHT },
            { name: 'Mail', url: 'mailto:simon.bruno.77@gmail.com', align: InteractiveAreas.ALIGN_RIGHT },
            { name: 'Twitch', url: 'https://www.twitch.tv/bruno_simon_dev', align: InteractiveAreas.ALIGN_RIGHT },
            { name: 'GitHub', url: 'https://github.com/brunosimon', align: InteractiveAreas.ALIGN_RIGHT },
            { name: 'LinkedIn', url: 'https://www.linkedin.com/in/simonbruno77/', align: InteractiveAreas.ALIGN_LEFT },
            { name: 'Discord', url: 'https://discord.com/users/202907325722263553', align: InteractiveAreas.ALIGN_LEFT },
        ]

        const radius = 6
        let i = 0

        for(const link of links)
        {
            const angle = i * Math.PI / (links.length - 1)
            const position = this.center.clone()
            position.x += Math.cos(angle) * radius
            position.y = 1
            position.z -= Math.sin(angle) * radius

            this.interactiveArea = this.game.interactiveAreas.create(
                position,
                link.name,
                link.align,
                () =>
                {
                    window.open(link.url, '_blank')
                }
            )
            
            i++
        }
    }
}