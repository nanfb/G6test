function stateManagement(type, value, item) { }

// 校验
function checkNode(node) {
    if (!node.name) {
        throw new Error('node name is not defined');
    }
    if (!node.options) {
        throw new Error('node options is not defined');
    }
}

/**
 * 注册自定义节点
 * @param nodeList<Array> 节点列表
 * 
 */
export function RegisterCustomNode(nodeList, G6) {
    for (let i = 0; i < nodeList.length; i++) {
        const node = nodeList[i];
        const { name, options } = node;
        checkNode(node)
        // 注册节点

        G6.registerNode(name, {
            draw(cfg, group) {
                if (options.customShapes.length) {
                    let keyShape = null;
                    options.customShapes.forEach(shape => {
                        console.log(cfg)
                        if (shape.name === 'body') { // body为自定义图形主体
                            keyShape = group.addShape(shape.shapeName, {
                                attrs: Object.assign({}, shape.attrs, cfg),
                                name: shape.name,
                                draggable: shape.draggable,
                            });
                        } else {
                            let DependentCfg = { ...cfg }
                            delete DependentCfg.x
                            delete DependentCfg.y
                            group.addShape(shape.shapeName, {
                                attrs: Object.assign({}, shape.attrs, DependentCfg),
                                name: shape.name,
                                draggable: shape.draggable,
                            });
                        }

                    });
                    if (keyShape === null) {
                        throw new Error('body is not defined');
                    }
                    return keyShape;
                }
            },
            afterDraw(cfg, group) {
                console.log('afterDraw------')
                node.afterDraw && node.afterDraw(cfg, group) // 自定义节点的afterDraw
            },
            setState(name, value, item) { // 自定义节点状态管理
                if (options.states.hasOwnProperty(name)) {
                    const group = item.getContainer();
                    const keyShape = group.get('children')[0]; // 顺序根据 draw 时确定, 0 为主 shape，也就是name为 body的
                    const state = options.states[name];
                    const { on, off } = state;
                    if (!on || !off) throw new Error(`Unset state implementation`)
                    if (value) {
                        // 有些状态要调用 api，不是单纯样式，要传入函数执行
                        if (typeof on === 'function') {
                            on(name, value, item);
                        } else {
                            keyShape.attr(on);
                        }
                    } else {
                        if (typeof off === 'function') {
                            off(name, value, item);
                        } else {
                            keyShape.attr(off);
                        }
                    }
                } else {
                    console.error(`${name}State is not defined, please check the node statusName`)
                }
            },
            ...(() => {
                let result = {}
                for (let otherKey in options) {
                    if (otherKey !== 'customShapes' && otherKey !== 'states') {
                        result[otherKey] = options[otherKey]
                    }
                }
                console.log(result)
                return result
            })()
        },
            node.extendedName,
        )

    }
}
