
// init: () => {
//     G6.registerNode(
//         "rect-node",
//         {
//             draw(cfg, group) {
//                 const { x, y } = cfg;
//                 const keyShape = group.addShape("rect", {
//                     attrs: {
//                         x,
//                         y,
//                         width: 10,
//                         height: 10,
//                         // radius: 0,
//                         fill: "#000",
//                         stroke: "blue",
//                     },
//                     name: "key-rect",
//                     draggable: true,
//                 });
//                 return keyShape;
//             },
//             // draw anchor-point circles according to the anchorPoints in afterDraw
//             afterDraw(cfg, group) {
//                 const bbox = group.getBBox();
//                 const anchorPoints = this.getAnchorPoints(cfg);
//                 anchorPoints.forEach((anchorPos, i) => {
//                     group.addShape("circle", {
//                         attrs: {
//                             r: 2,
//                             x: bbox.x + bbox.width * anchorPos[0],
//                             y: bbox.y + bbox.height * anchorPos[1],
//                             fill: "#fff",
//                             stroke: "#5F95FF",
//                             strokeWsidth: 1,
//                             cursor: 'crosshair'
//                         },
//                         // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
//                         name: `anchor-point`, // the name, for searching by group.find(ele => ele.get('name') === 'anchor-point')
//                         anchorPointIdx: i, // flag the idx of the anchor-point circle
//                         links: 0, // cache the number of edges connected to this shape
//                         visible: false, // invisible by default, shows up when links > 1 or the node is in showAnchors state
//                         draggable: true, // allow to catch the drag events on this shape
//                     });
//                 });
//             },
//             getAnchorPoints(cfg) {
//                 return (
//                     // 这个是自定义节点的位置 或者默认位置
//                     cfg.anchorPoints || [
//                         [0, 0.5],
//                         [0.33, 0],
//                         [0.66, 0],
//                         [1, 0.5],
//                         [0.33, 1],
//                         [0.66, 1],
//                     ]
//                 );
//             },
//             // response the state changes and show/hide the link-point circles
//             setState(name, value, item) {
//                 if (name === "showAnchors") {
//                     const anchorPoints = item
//                         .getContainer()
//                         .findAll((ele) => ele.get("name") === "anchor-point");
//                     // console.log(anchorPoints, 'anchorPoints')
//                     anchorPoints.forEach((point) => {
//                         // console.log(point.get("links"), 'point.get("links")')
//                         if (value) point.show();
//                         else point.hide();
//                     });
//                 }
//             },
//         },
//     )
// }
export default {
    name: 'rect-node',
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
            showAnchors: {
                state: true,
                name: 'showAnchors',
                on(name, value, item) {
                    console.log('on', '调用')
                    const anchorPoints = item
                        .getContainer()
                        .findAll((ele) => ele.get("name") === "anchor-point");
                    anchorPoints.forEach((point) => {
                        value && point.show();
                    });
                },
                off(name, value, item) {
                    const anchorPoints = item
                        .getContainer()
                        .findAll((ele) => ele.get("name") === "anchor-point");
                    anchorPoints.forEach((point) => {
                        value && point.hide();
                    });
                }
            }
        },
        customShapes: [{
            shapeName: 'rect',
            name: 'body',
            attrs: {
                x: 1,
                y: 1,
                width: 10,
                height: 10,
                // radius: 0,
                fill: "#000",
                stroke: "blue",
            },
            draggable: true,
        }],
        afterDraw(cfg, group) {  // 在这个钩子中注册连接桩，数量和样式
            const bbox = group.getBBox();
            const anchorPoints = this.getAnchorPoints(cfg);
            anchorPoints.forEach((anchorPos, i) => {
                group.addShape("circle", {
                    attrs: {
                        r: 2,
                        x: bbox.x + bbox.width * anchorPos[0],
                        y: bbox.y + bbox.height * anchorPos[1],
                        fill: "#fff",
                        stroke: "#5F95FF",
                        strokeWsidth: 1,
                        cursor: 'crosshair'
                    },
                    // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                    name: `anchor-point`, // the name, for searching by group.find(ele => ele.get('name') === 'anchor-point')
                    anchorPointIdx: i, // flag the idx of the anchor-point circle
                    links: 0, // cache the number of edges connected to this shape
                    visible: false, // invisible by default, shows up when links > 1 or the node is in showAnchors state
                    draggable: true, // allow to catch the drag events on this shape
                });
            });
        },
        getAnchorPoints(cfg) {
            return (
                // 这个是自定义节点的位置 或者默认位置
                cfg.anchorPoints || [
                    [0, 0.5],
                    [0.33, 0],
                    [0.66, 0],
                    [1, 0.5],
                    [0.33, 1],
                    [0.66, 1],
                ]
            );
        },
    },
    extendedName: ''
}

