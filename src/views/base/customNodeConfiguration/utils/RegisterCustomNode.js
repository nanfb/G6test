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
    if (!nodeList) {
        throw new Error('nodeList is not defined');
    }
    if (!Array.isArray(nodeList)) {
        throw new Error('nodeList is not Array');
    }
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
                        let DependentCfg = { ...cfg }
                        delete DependentCfg.x
                        delete DependentCfg.y
                        if (shape.name === 'body') { // body为自定义图形主体
                            keyShape = group.addShape('polygon', {
                                attrs: Object.assign({}, shape.attrs, cfg),
                                name: shape.name,
                                draggable: shape.draggable,
                            });
                        } else {
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
            setState(name, value, item) { // 自定义节点状态管理
                if (options.states.hasOwnProperty(name)) {
                    const group = item.getContainer();
                    const keyShape = group.get('children')[0];
                    const state = options.states[name];
                    const { on, off } = state;
                    if (value) {
                        if (on) {
                            keyShape.attr(on);
                        }
                    } else {
                        if (off) {
                            keyShape.attr(off);
                        }
                    }
                } else {
                    console.warn(`${name}State is not defined`)
                }
            },

        },
            node.extendedName,
        )

    }
}
