
import { _decorator, Component, Node, Size, Vec2, UITransform, size, Widget, warn, v2, Vec3, UI, v3 } from 'cc';
import { UIChangeBrotherEvnet, UISuperLayout } from './UISuperLayout';
const { ccclass, property } = _decorator;

@ccclass('UISpuerItem')
export class UISpuerItem extends Component {
    private layout: UISuperLayout
    private brother: Node | null = null;
    private originSize: Size = Size.ZERO;
    private originScale: Vec3 = Vec3.ZERO;

    constructor() {
        super();
        this.layout = new UISuperLayout();
    }
    /** 根据可视范围 和 一组item的个数 去掉 边距/间隔 来计算本item的真实宽度 */
    private get width() {
        if (this.layout.vertical) {
            // 垂直滑动时 固定宽度
            return (this.layout.accommodWidth - this.layout.spacingWidth) / this.layout.column
        } else {
            // 水平模式时 宽度随意
            return this.node.getComponent(UITransform)?.width ?? 0 * this.layout.getUsedScaleValue(this.node.getScale().x)
        }
    }
    /** 根据可视范围 和 一组item的个数 去掉 边距/间隔 来计算本item的真实高度 */
    private get height() {
        if (this.layout.horizontal) {
            // 水平模式时 固定高度
            return (this.layout.accommodHeight - this.layout.spacingWidth) / this.layout.column
        } else {
            // 垂直滑动时 高度随意
            return this.node.getComponent(UITransform)?.height ?? 0 * this.layout.getUsedScaleValue(this.node.getScale().y)
        }
    }
    onLoad() {
        // 向node写入一个方法 省去了先获取组件然后调用的步骤
        let widget = this.node.getComponent(Widget)
        if (widget) {
            warn("UISuperItem: item不允许挂Widget组件 请手动移除")
            this.node._removeComponent(widget)
        }
    }
    public saveOriginSize() {
        this.originSize = size(this.width, this.height)
        this.node.getComponent(UITransform)?.setContentSize(this.originSize);
        this.originScale = this.node.getScale();
    }
    public init(layout: UISuperLayout) {
        this.layout = layout
        this.layout.node.on(UIChangeBrotherEvnet, this.onChangeBrother, this)
        this.saveOriginSize()
        this.node.on(Node.EventType.SIZE_CHANGED, this.watchSize, this)
        this.node.on(Node.EventType.TRANSFORM_CHANGED, this.watchSize, this)
        this.onChangeBrother()
    }
    onDestroy() {
        this.layout.node.off(UIChangeBrotherEvnet, this.onChangeBrother, this)
        this.node.off(Node.EventType.SIZE_CHANGED, this.watchSize, this)
        this.node.off(Node.EventType.TRANSFORM_CHANGED, this.watchSize, this)
        this.unlisten()
    }
    /**
     * 当兄弟节点的顺序变化时 来改变自己监听的对象
     * 0,1,2,3,4,5,6,7,8,9 例如列表中共有10个item 0是header 9是footer 
     * 正序排列时 监听的顺序是 9->8->7->6->5->4->3->2->1->0 0的 brother=null 
     * 向下填充的逻辑是 0跑到9后面 0=footer 0的brother=9 相对9的位置设置自己 此时1=header 
     * 向上填充的逻辑是 9跑到0前面 此时9=header 9的brother=null 主动设置自己相对于0前面位置之后 0的brother=9 8=footer
     */
    private onChangeBrother() {
        let _brother = this.layout.getBrotherNode(this.node) //获取我应该监听的那个兄弟
        if (_brother?.uuid == this.brother?.uuid) return //如果没有变化 则跳过
        this.unlisten() //我的兄弟换人了？先移除我原来的
        this.brother = _brother //他是我的兄弟
        this.listen() //监听他
        this.watchBrother() //相对兄弟节点来设置自己的位置
    }
    private listen() {
        this.brother?.on('leave', this.unlisten, this)
        this.brother?.on(Node.EventType.TRANSFORM_CHANGED, this.watchBrother, this)
    }
    private unlisten() {
        this.brother?.off('leave', this.unlisten, this)
        this.brother?.off(Node.EventType.TRANSFORM_CHANGED, this.watchBrother, this)
        this.brother = null
    }
    /** 当我的尺寸/缩放改变时 */
    private watchSize() {
        let uit = this.node.getComponent(UITransform);
        if (this.layout.column > 1) { //如果是Grid模式 不允许修改尺寸/缩放 强制改回来
            uit?.setContentSize(this.originSize);
            this.node.setScale(this.originScale)
        } else {
            if (this.layout.vertical && (uit?.width != this.originSize.width || this.node.getScale().x != this.originScale.x)) {
                warn("垂直排列不允许修改【宽度】")
                uit?.setContentSize(this.originSize.width, uit.height);
                this.node.setScale(this.originScale.x, this.node.getScale().y, this.node.getScale().z)

            } else if (this.layout.horizontal && (uit?.height != this.originSize.height || this.node.getScale().y != this.originScale.y)) {
                warn("水平排列不允许修改【高度】")
                uit?.setContentSize(uit.width, this.originSize.height);
                this.node.setScale(this.node.getScale().x, this.originScale.y, this.node.getScale().z)
            }
            // 如果我监听了兄弟节点就设置自己相对兄弟节点的位置，否则 我就发送一个位置变化的消息 让监听我的兄弟相对我做出变化
            this.brother && this.watchBrother()
            this.layout.resetScrollView()
            this.node.emit(Node.EventType.TRANSFORM_CHANGED)
        }
        if (this.node.getSiblingIndex() == 0 && this.layout.isNormalSize) {
            this.node.setPosition(this.layout.getGroupHeader(this.node))
        }
    }
    // 设置自己相对于上一个兄弟节点的位置
    public watchBrother() {
        if (!this.brother) return
        if (this.layout.headerToFooter) { //正序排列时
            this.headerToFooterRelativeToFooter(this.brother)
        } else {//倒序排列时
            this.footerToHeaderRelativeToFooter(this.brother)
        }
    }
    private isOutOfBoundary(offset: Vec3) {
        if (this.layout.vertical && offset.y == 0) return true
        if (this.layout.horizontal && offset.x == 0) return true
        return false
    }
    /** 从下到上排序方向 检查头部是否需要向上填充 */
    private footerToHeaderWatchHeader() {
        // 如果不是头部一组的任意一个时跳过 比如一组有3个item 只计算 0，1，2 
        if (this.layout.getSiblingIndex(this.node) >= this.layout.column) return
        // 如果此时【尾部】已经是最后一个数据时
        let index = this.layout.footer.getSiblingIndex() + 1
        if (index >= this.layout.maxItemTotal) {
            if (!this.layout.footerLoop || this.layout.scrollToHeaderOrFooter) return
            index = 0
        }
        // 计算超出的偏移量 (从下到上排序方向时 头部在 下尾部在上 检测【头部】是否超出下边框)
        let offset = this.layout.isOutOfBoundaryFooter(this.node)
        // 没有超出时跳过
        if (!this.isOutOfBoundary(offset)) return
        // 将自己的数据索引 + 1
        this.node.setSiblingIndex(index)
        // 发送通知到应用层 刷新显示
        this.layout.notifyRefreshItem(this.node)
        // 发给监听我的节点 通知我离开了 移除对我的所有监听
        this.node.emit("leave")
        // 将自己的节点索引设置到尾部
        this.layout.setSiblingIndex(this.node, this.layout.children.length - 1)
    }
    /** 从下到上排序方向 检查尾部是否需要向下填充 */
    private footerToHeaderWatchFooter() {
        // 如果不是尾部一组的任意一个时跳过 比如一组有3个item 只计算末尾的3个item 
        if (this.layout.getSiblingIndex(this.node) < this.layout.children.length - this.layout.column) return
        // 如果此时【头部】已经是第一个数据时
        let index = this.layout.header.getSiblingIndex() - 1
        if (index < 0) {
            // 如果没有使用无限循环功能 否则不往下走
            if (!this.layout.headerLoop || this.layout.scrollToHeaderOrFooter) return
            index = this.node.getSiblingIndex();
        }
        // 计算超出的偏移量 (从下到上排序方向时 头部在 下尾部在上 检测【尾部】是否超出下边框)
        let offset = this.layout.isOutOfBoundaryHeader(this.node)
        // 没有超出时跳过
        if (!this.isOutOfBoundary(offset)) return
        // 将自己的数据索引 - 1
        this.node.setSiblingIndex(index)
        // 发送通知到应用层 刷新显示
        this.layout.notifyRefreshItem(this.node)
        // 发给监听我的兄弟 通知我离开了 移除对我的所有监听
        this.node.emit("leave")
        // 因为我是尾部 我监听了别人，此时移除我的所有监听 因为我马上就要成为老大 老大不需要监听任何人
        this.unlisten()
        // 因为我是老大 我不能相对别人来设置自己的相对位置，所以我需要主动设置自己(相对上一个老大的位置来设置自己) 别人都会相对我的位置做出变化
        this.footerToHeaderRelativeToHeader(this.layout.header)
        // 将自己的节点索引设置到头部
        this.layout.setSiblingIndex(this.node, 0)
    }
    /** 从上到下排序方向 检查头部是否需要向下填充 */
    private headerToFooterWatchHeader() {
        // 如果不是头部一组的任意一个时跳过 比如一组有3个item 只计算 0，1，2 
        if (this.layout.getSiblingIndex(this.node) >= this.layout.column) return
        // 如果此时【尾部】已经是第一个数据时  
        let index = this.layout.footer.getSiblingIndex() + 1
        if (index > this.layout.maxItemTotal - 1) {
            // 如果没有使用无限循环功能 否则不往下走
            if (!this.layout.footerLoop || this.layout.scrollToHeaderOrFooter) return
            index = 0
        }
        // 计算超出的偏移量 (从下到上排序方向时 头部在下 尾部在上 检测【尾部】是否超出下边框)
        let offset = this.layout.isOutOfBoundaryHeader(this.node)
        // 没有超出时跳过
        if (!this.isOutOfBoundary(offset)) return
        // 将自己的数据索引 + 1
        this.node.setSiblingIndex(index);
        // 发送通知到应用层 刷新显示
        this.layout.notifyRefreshItem(this.node)
        // 发给监听我的兄弟 通知我离开了 移除对我的所有监听
        this.node.emit("leave")
        // 将自己的节点索引设置到尾部
        this.layout.setSiblingIndex(this.node, this.layout.children.length - 1)
    }
    /** 从上到下排序方向 检查尾部是否需要向上填充 */
    private headerToFooterWatchFooter() {
        // 如果不是尾部一组的任意一个时跳过 比如一组有3个item 只计算末尾的3个item 
        if (this.layout.getSiblingIndex(this.node) < this.layout.children.length - this.layout.column) return
        // 如果此时【头部】已经是第一个数据时 
        let index = this.layout.header.getSiblingIndex() - 1
        if (index < 0) {
            // 如果没有使用无限循环功能 否则不往下走
            if (!this.layout.headerLoop || this.layout.scrollToHeaderOrFooter) return
            index = this.node.getSiblingIndex()
        }
        // 计算超出的偏移量 (从上到下排序方向时 头部在上 尾部在下 检测【尾部】是否超出下边框)
        let offset = this.layout.isOutOfBoundaryFooter(this.node)
        // 没有超出时跳过
        if (!this.isOutOfBoundary(offset)) return
        // 将自己的数据索引 - 1
        this.node.setSiblingIndex(index);
        // 发送通知到应用层 刷新显示
        this.layout.notifyRefreshItem(this.node)
        // 发给监听我的兄弟 通知我离开了 移除对我的所有监听
        this.node.emit("leave")
        // 因为我是尾部 我监听了别人，此时移除我的所有监听 因为我马上就要成为老大 老大不需要监听任何人
        this.unlisten()
        // 因为我是老大 我不能相对别人来设置自己的相对位置，所以我需要主动设置自己(相对上一个老大的位置来设置自己) 别人都会相对我的位置做出变化
        this.headerToFooterRelativeToHeader(this.layout.header)
        // 将自己的节点索引设置到尾部
        this.layout.setSiblingIndex(this.node, 0)
    }
    /** isScrollToFooter=true 向下滑动 */
    public watchSelf(isScrollToFooter: boolean) {
        if (isScrollToFooter) {
            if (this.layout.headerToFooter) {
                // 从【上到下排序】方向 检查【尾部】是否需要向上填充
                this.headerToFooterWatchFooter()
            } else {
                // 从【下到上排序】方向 检查【头部】是否需要向上填充
                this.footerToHeaderWatchHeader()
            }
        } else {
            if (this.layout.headerToFooter) {
                // 从【上到下排序】方向 检查【头部】是否需要向下填充
                this.headerToFooterWatchHeader()
            } else {
                // 从【下到上排序】方向 检查【尾部】是否需要向下填充
                this.footerToHeaderWatchFooter()
            }
        }
    }
    /** 从下到上 从右到左 排序方向  设置自己到相对node的头部 */
    private footerToHeaderRelativeToHeader(relative: Node) {
        let x = this.node.getPosition().x, y = this.node.getPosition().y;
        // 从下到上
        if (this.layout.vertical) {
            if (this.layout.isGroupHeader(relative)) {
                x = this.layout.getGroupFooter(this.node).x
                y = this.layout.getGroupBottomY(this.node, relative)
            } else {
                x = this.layout.getGroupLeftX(this.node, relative)
                y = relative.getPosition().y
            }
            if (this.node.getSiblingIndex() == 0) {
                x = this.layout.getGroupHeader(this.node).x
            }
        } else {
            // 从右到左
            if (this.layout.isGroupHeader(relative)) {
                x = this.layout.getGroupRightX(this.node, relative)
                y = this.layout.getGroupFooter(this.node).y
            } else {
                x = relative.getPosition().x
                y = this.layout.getGroupTopY(this.node, relative)
            }
            if (this.node.getSiblingIndex() == 0) {
                y = this.layout.getGroupHeader(this.node).y
            }
        }
        this.node.setPosition(v3(x, y, 0));
    }
    /** 从下到上 从右到左 排序方向 设置自己到相对node的尾部 */
    private footerToHeaderRelativeToFooter(relative: Node) {
        let x = this.node.getPosition().x, y = this.node.getPosition().y;
        // 从下到上
        if (this.layout.vertical) {
            if (this.layout.isGroupFooter(relative)) {
                x = this.layout.getGroupHeader(this.node).x
                y = this.layout.getGroupTopY(this.node, relative)
            } else {
                x = this.layout.getGroupRightX(this.node, relative)
                y = relative.getPosition().y
            }
        } else {
            // 从右到左
            if (this.layout.isGroupFooter(relative)) {
                x = this.layout.getGroupLeftX(this.node, relative)
                y = this.layout.getGroupHeader(this.node).y
            } else {
                x = relative.getPosition().x
                y = this.layout.getGroupBottomY(this.node, relative)
            }
        }
        this.node.setPosition(v3(x, y, 0));
    }
    /** 从上到下 从左到右 排序方向 设置自己到相对node的头部 */
    private headerToFooterRelativeToHeader(relative: Node) {
        let x = this.node.getPosition().x, y = this.node.getPosition().y;
        // 从上到下
        if (this.layout.vertical) {
            if (this.layout.isGroupHeader(relative)) {
                x = this.layout.getGroupFooter(this.node).x
                y = this.layout.getGroupTopY(this.node, relative)
            } else {
                x = this.layout.getGroupLeftX(this.node, relative)
                y = relative.getPosition().y
            }
            if (this.node.getSiblingIndex() == 0) {
                x = this.layout.getGroupHeader(this.node).x
            }
        } else {
            // 从左到右
            if (this.layout.isGroupHeader(relative)) {
                x = this.layout.getGroupLeftX(this.node, relative)
                y = this.layout.getGroupFooter(this.node).y
            } else {
                x = relative.getPosition().x
                y = this.layout.getGroupTopY(this.node, relative)
            }
            if (this.node.getSiblingIndex() == 0) {
                y = this.layout.getGroupHeader(this.node).y
            }
        }
        this.node.setPosition(v3(x, y, 0));
    }
    /** 从上到下 从左到右 排序方向 设置自己到相对node尾部 */
    private headerToFooterRelativeToFooter(relative: Node) {
        let x = this.node.getPosition().x, y = this.node.getPosition().y;
        // 从上到下
        if (this.layout.vertical) {
            if (this.layout.isGroupFooter(relative)) {
                x = this.layout.getGroupHeader(this.node).x
                y = this.layout.getGroupBottomY(this.node, relative)
            } else {
                x = this.layout.getGroupRightX(this.node, relative)
                y = relative.getPosition().y
            }
        } else {
            // 从左到右
            if (this.layout.isGroupFooter(relative)) {
                x = this.layout.getGroupRightX(this.node, relative)
                y = this.layout.getGroupHeader(this.node).y
            } else {
                x = relative.getPosition().x
                y = this.layout.getGroupBottomY(this.node, relative)
            }
        }
        this.node.setPosition(v3(x, y, 0));
    }
}
