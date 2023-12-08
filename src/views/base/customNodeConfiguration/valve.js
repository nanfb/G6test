export default {
    name: 'valve',
    options: {
        states: {
            selected: {
                state: true,
                name: 'selected',
                on: {
                    stroke: '#7622FF',
                    lineWidth: 1,
                    lineDash: [2, 2],
                },
                off: {
                    stroke: '#000',
                    lineWidth: 1,
                    lineDash: [0, 0],

                }
            },
            hover: {
                state: true,
                name: 'hover',
                on: {
                    fill: '#CCCCCC',
                    cursor: 'move',
                },
                off: {
                    fill: 'green',
                    cursor: 'move',
                }

            },
        },
        customShapes: [{
            shapeName: 'polygon',
            name: 'body',
            attrs: {
                x: 1,
                y: 1,
                points: [
                    [0, 0],
                    [0, 10],
                    [5, 5],
                    [10, 0],
                    [10, 10],
                    [5, 5],
                    [0, 0],
                ],
                stroke: '#000',
                fill: 'green',
                cursor: 'move',
            },
            draggable: true,
        }, {
            shapeName: 'text',
            name: 'description',
            attrs: {
                x: 5,
                y: 15,
                textAlign: 'center',
                textBaseline: 'middle',
                text: '阀门',
                fill: '#000',
                fontSize: 8,
                cursor: 'move',
            },
            draggable: true,
        }],
    },
    // 继承节点
    extendedName: ''
}