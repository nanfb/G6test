import G6 from '@antv/g6';
G6.registerNode(
    'valve',
    (cfg) => {
        return (
            `
            <group>
                <rect draggable="true" style={{width: 100, height: 50, stroke: '#666', fill: '#fff'}} />
                <text style={{marginTop: 10, marginLeft: 10, fontSize: 12, fontWeight: 'bold',color: 'red'}}>${cfg.label}</text>
            </rect>
            `
        )
    },
    'single-node',
)