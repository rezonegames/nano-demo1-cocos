
import { _decorator, Component, Node, Enum, Prefab, Vec2, EventHandler, Size, Vec3, UITransform, v2, v3, instantiate, director } from 'cc';
import { UISpuerItem } from './UISpuerItem';
import { UISpuerScrollView } from './UISpuerScrollView';

const { ccclass, property } = _decorator;

const EPSILON = 1e-4;
export const UIChangeBrotherEvnet = "UIChangeBrotherEvnet"
export enum UISuperAxis {
    HORIZONTAL = 0,
    VERTICAL = 1
}
export enum UISuperDirection {
    HEADER_TO_FOOTER = 0,
    FOOTER_TO_HEADER = 1,
}

@ccclass('UISuperLayout')
export class UISuperLayout extends Component {
    @property({ type: Enum(UISuperAxis), displayName: "排列方向" }) startAxis: UISuperAxis = UISuperAxis.VERTICAL
    @property({ type: Enum(UISuperDirection), displayName: "排列子节点的方向" }) direction: UISuperDirection = UISuperDirection.HEADER_TO_FOOTER
    @property({ displayName: "上边距" }) paddingTop: number = 0
    @property({ displayName: "下边距" }) paddingBottom: number = 0
    @property({ displayName: "左边距" }) paddingLeft: number = 0
    @property({ displayName: "右边距" }) paddingRight: number = 0
    @property({ displayName: "间隔" }) spacing: Vec2 = Vec2.ZERO
    @property({ displayName: "每组item个数", tooltip: "单行的列数 或 单列的行数" }) column: number = 2
    @property({ displayName: "item创建倍率", tooltip: "相对于view的尺寸 默认2倍" }) multiple: number = 2
    @property({ type: Prefab, displayName: "item Prefab" }) prefab: Prefab
    @property({ displayName: "头部滑动循环" }) headerLoop: boolean = false
    @property({ displayName: "尾部滑动循环" }) footerLoop: boolean = false
    @property affectedByScale: boolean = true
    @property(EventHandler) refreshItemEvents: EventHandler[] = []
    private _gener: Generator | null = null;
    private _isinited: boolean = false
    private _maxPrefabTotal: number = 0
    private _children: Node[] = [] //和this.node.children 保持同步
    private _scrollView: UISpuerScrollView | null = null
    private _maxItemTotal: number = 0
    private _prevLayoutPosition: Vec3 = Vec3.ZERO
    /** 当前的滚动是否是由 scrollTo 方法执行的 和touch滑动做个区分*/
    public scrollToHeaderOrFooter: boolean = false

    constructor() {
        super();
        this.prefab = new Prefab();
    }
    /** 根据上一次和本次的坐标变化计算滑动方向 */
    private get layoutDirection(): Vec3 {
        let x, y;
        let view = this.node.getComponent(UITransform);
        if (!!view) {
            if (this.vertical) {
                y = view?.contentSize.y - this._prevLayoutPosition.y
            } else {
                x = view?.contentSize.x - this._prevLayoutPosition.x
            }
            this._prevLayoutPosition = this.node.getPosition()
        }
        return v3(x, y, 0);
    }
    /** 是否是向下滑动 */
    private get isScrollToFooter(): boolean {
        if (this.vertical) {
            return this.layoutDirection.y < 0
        } else {
            return this.layoutDirection.x > 0
        }
    }
    /** 自己维护的子节点数组 和this.node.children 保持同步 */
    public get children() { return this._children }
    /** 最大数据总数 */
    public get maxItemTotal() { return this._maxItemTotal }
    /** 当前被创建的item总数 */
    public get maxPrefabTotal() { return this._maxPrefabTotal }
    /** scrollView.view尺寸 */
    public get viewSize(): Size {
        return this.scrollView.node.getComponent(UITransform)?.contentSize ?? Size.ZERO;
    }
    /** 是否是垂直模式 */
    public get vertical(): boolean {
        return this.startAxis == UISuperAxis.VERTICAL
    }
    /** 是否是水平模式 */
    public get horizontal(): boolean {
        return this.startAxis == UISuperAxis.HORIZONTAL
    }
    /** 是否是正序排列 */
    public get headerToFooter(): boolean {
        return this.direction == UISuperDirection.HEADER_TO_FOOTER
    }
    /** 是否是倒序排列 */
    public get footerToHeader(): boolean {
        return this.direction == UISuperDirection.FOOTER_TO_HEADER
    }
    /** 水平间隔总宽度 (Grid 模式返回多个间隔总宽度) */
    public get spacingWidth() {
        return this.spacing.x * (this.column - 1)
    }
    /** 水平间隔总高度 (Grid 模式返回多个间隔总高度) */
    public get spacingHeight() {
        return this.spacing.y * (this.column - 1)
    }
    /** 可容纳item的真实宽度 */
    public get accommodWidth() {
        return this.getContentSize().width - this.paddingLeft - this.paddingRight
    }
    /** 可容纳item的真实高度 */
    public get accommodHeight() {
        return this.getContentSize().height - this.paddingTop - this.paddingBottom
    }
    public get scrollView(): UISpuerScrollView {
        if (!this._scrollView) this._scrollView = this.node.parent?.parent?.getComponent(UISpuerScrollView) ?? new UISpuerScrollView();
        return this._scrollView
    }
    /** 当前头部的item */
    public get header(): Node {
        return this._children[0];
    }
    /** 当前尾部的item */
    public get footer(): Node {
        return this._children[this._children.length - 1];
    }
    /** 真实的上边距 */
    public get topBoundary() {
        if (this.headerToFooter) {
            return this.headerBoundaryY + this.paddingTop
        } else {
            return this.footerBoundaryY + this.paddingTop
        }
    }
    /** 真实的下边距 */
    public get bottomBoundary() {
        if (this.headerToFooter) {
            return this.footerBoundaryY - this.paddingBottom
        } else {
            return this.headerBoundaryY - this.paddingBottom
        }
    }
    /** 真实的左边距 */
    public get leftBoundary() {
        if (this.headerToFooter) {
            return this.headerBoundaryX - this.paddingLeft
        } else {
            return this.footerBoundaryX - this.paddingLeft
        }
    }
    /** 真实的右边距 */
    public get rightBoundary() {
        if (this.headerToFooter) {
            return this.footerBoundaryX + this.paddingRight
        } else {
            return this.headerBoundaryX + this.paddingRight
        }
    }
    /** 头部item的世界坐标边框 类似 xMin、xMax */
    public get headerBoundaryX() {
        let headerUit = this.header.getComponent(UITransform) ?? new UITransform();
        if (this.headerToFooter) {
            return this.node.getPosition().x + this.header.getPosition().x - headerUit.anchorX * this.getScaleWidth(this.header)
        } else {
            return this.node.getPosition().x + this.header.getPosition().x + (1 - headerUit.anchorX) * this.getScaleWidth(this.header)
        }
    }
    /** 头部item的世界坐标边框 类似 yMin、yMax */
    public get headerBoundaryY() {
        let headerUit = this.header.getComponent(UITransform) ?? new UITransform();
        if (this.headerToFooter) {
            return this.node.getPosition().y + this.header.getPosition().y + (1 - headerUit.anchorY) * this.getScaleHeight(this.header)
        } else {
            return this.node.getPosition().y + this.header.getPosition().y - headerUit.anchorY * this.getScaleHeight(this.header)
        }
    }
    /** 尾部item的世界坐标边框 类似 xMin、xMax */
    public get footerBoundaryX() {
        let footerUit = this.footer.getComponent(UITransform) ?? new UITransform();
        if (this.headerToFooter) {
            return this.node.getPosition().x + this.footer.getPosition().x + (1 - footerUit.anchorX) * this.getScaleWidth(this.footer)
        } else {
            return this.node.getPosition().x + this.footer.getPosition().x - footerUit.anchorX * this.getScaleWidth(this.footer)
        }
    }
    /** 尾部item的世界坐标边框 类似 yMin、yMax */
    public get footerBoundaryY() {
        let footerUit = this.footer.getComponent(UITransform) ?? new UITransform();
        if (this.headerToFooter) {
            return this.node.getPosition().y + this.footer.getPosition().y - footerUit.anchorY * this.getScaleHeight(this.footer)
        } else {
            return this.node.getPosition().y + this.footer.getPosition().y + (1 - footerUit.anchorY) * this.getScaleHeight(this.footer)
        }
    }
    public get isNormalSize(): boolean {
        return this.getContentSize().equals(this.viewSize) ?? false;
    }

    /** 重写 this.node.getContentSize 动态计算头尾item 返回虚拟的尺寸 非content设置的尺寸 */
    public getContentSize(): Size {
        let size = this.getReallySize()
        let viewSize = this.scrollView.view?.contentSize ?? Size.ZERO;
        // 列表为空时 直接返回 scrollView.view 的尺寸
        if (size.height < viewSize.height) {
            size.height = viewSize.height
        }
        if (size.width < viewSize.width) {
            size.width = viewSize.width
        }
        return size
    }
    /** 返回 header到 footer 之间的整体尺寸 */
    public getReallySize(): Size {
        if (this.node.children.length == 0) return this.viewSize
        let size = Size.ZERO
        let w, h;
        if (this.headerToFooter) { // 根据header和footer计算出真实的content尺寸 
            w = this.footerBoundaryX + -this.headerBoundaryX + this.paddingLeft + this.paddingRight
            h = this.headerBoundaryY + -this.footerBoundaryY + this.paddingTop + this.paddingBottom
        } else {
            w = this.headerBoundaryX + -this.footerBoundaryX + this.paddingLeft + this.paddingRight
            h = this.footerBoundaryY + -this.headerBoundaryY + this.paddingTop + this.paddingBottom
        }
        return size.set(w, h);
    }
    /** 重置scrollview */
    public resetScrollView() {
        this.scrollView.reset()
    }
    /** 获取缩放系数 */
    public getUsedScaleValue(value: number) {
        return this.affectedByScale ? Math.abs(value) : 1
    }
    /** 设置最大item数量 */
    public async total(value: number) {
        this.scrollView.stopAutoScroll()
        this.scrollView.release() // 释放（功能用于上拉加载 下拉刷新）
        this.initlized()  // 初始化
        await this.asyncCreateItem(value) // 分帧创建item
        let dataOffset = this.getDataOffset(value) //获取数据偏移量（根据value相对于 _maxItemTotal 计算增加、减少的数量）
        let reallyOffset = this.getReallyOffset(dataOffset) // 获取真实的数据偏移（Grid模式 功能用于判断是否需要偏移header来将下方填满）
        this.refreshItems(value, reallyOffset) //通过已有的item['index'] 加上数据偏移 来是刷新显示
        this._maxItemTotal = value // 记录当前总数
    }
    /** 获取兄弟节点 */
    public getBrotherNode(node: Node) {
        let index = this.getSiblingIndex(node) - 1 // 此 getSiblingIndex 非 this.node.getSiblingIndex
        return this._children[index]
    }
    /** 是否是一组item中第一个（垂直滑动中 一组item 就是单行的所有列 、水平滑动中 一组item 就是单列中所有行）*/
    public isGroupHeader(node: Node): boolean {
        let xOry = this.getGroupHeader(node)
        let pos = this.vertical ? v2(xOry.x, 0) : v2(0, xOry.y)
        let self = this.vertical ? v2(node.getPosition().x, 0) : v2(0, node.getPosition().y)
        return self.equals(pos, EPSILON)
    }
    /** 是否是一组item中最后一个（垂直滑动中 一组item 就是单行的所有列 、水平滑动中 一组item 就是单列中所有行）*/
    public isGroupFooter(node: Node): boolean {
        let xOry = this.getGroupFooter(node)
        let pos = this.vertical ? v2(xOry.x, 0) : v2(0, xOry.y)
        let self = this.vertical ? v2(node.getPosition().x, 0) : v2(0, node.getPosition().y)
        return self.equals(pos, EPSILON)
    }
    /** 获取一组item中起始位置 （垂直滑动中 一组item 就是单行的所有列 、水平滑动中 一组item 就是单列中所有行）*/
    public getGroupHeader(node: Node): Vec3 {
        let uit = node.getComponent(UITransform) ?? new UITransform();
        let thisuit = this.node.getComponent(UITransform) ?? new UITransform();
        if (!node) return Vec3.ZERO;
        let x, y;
        if (this.vertical) {
            if (this.headerToFooter) {
                x = uit.anchorX * this.getScaleWidth(node) + (this.paddingLeft * node.getScale().x) - (thisuit.anchorX * this.viewSize.width * node.getScale().x)
                y = (1 - uit.anchorY) * -this.getScaleHeight(node) - this.paddingTop + (1 - thisuit.anchorY) * this.viewSize.height
            } else {
                x = uit.anchorX * this.getScaleWidth(node) + this.paddingLeft - thisuit.anchorX * this.viewSize.width
                y = uit.anchorY * this.getScaleHeight(node) + this.paddingBottom - thisuit.anchorY * this.viewSize.height
            }
        } else {
            if (this.headerToFooter) {
                x = uit.anchorX * this.getScaleWidth(node) + this.paddingLeft - thisuit.anchorX * this.viewSize.width
                y = (1 - uit.anchorY) * -uit.height - this.paddingTop + (1 - thisuit.anchorY) * this.viewSize.height
            } else {
                x = this.accommodWidth * thisuit.anchorX ?? 0 - this.getScaleWidth(node) * (1 - uit.anchorX)
                y = (1 - uit.anchorY) * -uit.height - this.paddingTop + (1 - thisuit.anchorY) * this.viewSize.height
            }
        }
        return v3(x, y, 0);
    }
    /** 获取一组item中结束位置 （垂直滑动中 一组item 就是单行的所有列 、水平滑动中 一组item 就是单列中所有行）*/
    public getGroupFooter(node: Node): Vec3 {
        let uit = node.getComponent(UITransform) ?? new UITransform();
        let thisuit = this.node.getComponent(UITransform) ?? new UITransform();
        let x, y;
        if (!node) return Vec3.ZERO
        if (this.vertical) {
            x = (this.accommodWidth + this.paddingLeft) * thisuit.anchorX - (this.getScaleWidth(node) * (1 - uit.anchorX) + thisuit.anchorX * this.paddingRight)
            y = node.getPosition().y;
        } else {
            x = node.getPosition().x;
            y = -((this.accommodHeight + this.paddingTop) * thisuit.anchorY - this.getScaleHeight(node) * uit.anchorY) + (1 - uit.anchorY) * this.paddingBottom
        }
        return v3(x, y, 0);
    }
    /** 获取一组item中 node 相对 relative 右偏移量 （垂直滑动中 一组item 就是单行的所有列 、水平滑动中 一组item 就是单列中所有行）*/
    public getGroupRightX(node: Node, relative: Node) {
        let nodeUit = node.getComponent(UITransform) ?? new UITransform();
        let relativeUit = relative.getComponent(UITransform) ?? new UITransform();
        if (!node || !relative) return this.getGroupHeader(node).x
        let prevWidth = relative.getPosition().x + this.getScaleWidth(relative) * (1 - relativeUit.anchorX)
        let selfWidth = this.getScaleWidth(node) * nodeUit.anchorX
        return prevWidth + selfWidth + this.spacing.x
    }
    /** 获取一组item中 node 相对 relative 左偏移量 （垂直滑动中 一组item 就是单行的所有列 、水平滑动中 一组item 就是单列中所有行）*/
    public getGroupLeftX(node: Node, relative: Node) {
        let nodeUit = node.getComponent(UITransform) ?? new UITransform();
        let relativeUit = relative.getComponent(UITransform) ?? new UITransform();
        if (!node || !relative) return this.getGroupFooter(node).x
        let prevWidth = relative.getPosition().x - this.getScaleWidth(relative) * relativeUit.anchorX
        let selfWidth = this.getScaleWidth(node) * (1 - nodeUit.anchorX)
        return prevWidth - selfWidth - this.spacing.x
    }
    /** 获取一组item中 node 相对 relative 下偏移量 （垂直滑动中 一组item 就是单行的所有列 、水平滑动中 一组item 就是单列中所有行）*/
    public getGroupBottomY(node: Node, relative: Node) {
        let nodeUit = node.getComponent(UITransform) ?? new UITransform();
        let relativeUit = relative.getComponent(UITransform) ?? new UITransform();
        let prevHeight = relative.getPosition().y - this.getScaleHeight(relative) * relativeUit.anchorY
        let selfHeight = this.getScaleHeight(node) * (1 - nodeUit.anchorY)
        return prevHeight - selfHeight - this.spacing.y
    }
    /** 获取一组item中 node 相对 relative 上偏移量 （垂直滑动中 一组item 就是单行的所有列 、水平滑动中 一组item 就是单列中所有行）*/
    public getGroupTopY(node: Node, relative: Node) {
        let nodeUit = node.getComponent(UITransform) ?? new UITransform();
        let relativeUit = relative.getComponent(UITransform) ?? new UITransform();
        let prevHeight = relative.getPosition().y + this.getScaleHeight(relative) * (1 - relativeUit.anchorY)
        let selfHeight = this.getScaleHeight(node) * nodeUit.anchorY
        return prevHeight + selfHeight + this.spacing.y
    }
    /** 判断给定的 node 乘以 multiple 倍数后 是否超出了头部边框 （ multiple = 1 就是一个node的尺寸 默认1.5倍）*/
    public isOutOfBoundaryHeader(node: Node, multiple: number = 1.5) {
        let nodeUit = node.getComponent(UITransform) ?? new UITransform();
        let width = nodeUit.width * this.getUsedScaleValue(node.getScale().x) * multiple
        let height = -nodeUit.height * this.getUsedScaleValue(node.getScale().y) * multiple
        let offset = this.scrollView.getHowMuchOutOfBoundary(v3(width, height, 0))
        return offset
    }
    /** 判断给定的 node 乘以 multiple 倍数后 是否超出了尾部部边框 （ multiple = 1 就是一个node的尺寸 默认1.5倍）*/
    public isOutOfBoundaryFooter(node: Node, multiple: number = 1.5) {
        let nodeUit = node.getComponent(UITransform) ?? new UITransform();
        let width = -nodeUit.width * this.getUsedScaleValue(node.getScale().x) * multiple
        let height = nodeUit.height * this.getUsedScaleValue(node.getScale().y) * multiple
        let offset = this.scrollView.getHowMuchOutOfBoundary(v3(width, height))
        return offset
    }
    /** 滚动到头部 （根据 排列方向、排列子节点的方向）来调用 scrollView.scrollTo... 方法 */
    public scrollToHeader(timeInSecond: number, attenuated?: boolean) {
        this.scrollToHeaderOrFooter = timeInSecond > 0
        this.scrollView.stopAutoScroll()
        this.resetToHeader()
        if (this.headerToFooter) {
            if (this.vertical) {
                this.scrollView.scrollToTop(timeInSecond, attenuated)
            } else {
                this.scrollView.scrollToLeft(timeInSecond, attenuated)
            }
        } else {
            if (this.vertical) {
                this.scrollView.scrollToBottom(timeInSecond, attenuated)
            } else {
                this.scrollView.scrollToRight(timeInSecond, attenuated)
            }
        }
    }
    /** 滚动到尾部（根据 排列方向、排列子节点的方向）来调用 scrollView.scrollTo... 方法 */
    public scrollToFooter(timeInSecond: number, attenuated?: boolean) {
        this.scrollToHeaderOrFooter = timeInSecond > 0
        this.scrollView.stopAutoScroll()
        this.resetToFooter()
        if (this.headerToFooter) {
            if (this.vertical) {
                this.scrollView.scrollToBottom(timeInSecond, attenuated)
            } else {
                this.scrollView.scrollToRight(timeInSecond, attenuated)
            }
        } else {
            if (this.vertical) {
                this.scrollView.scrollToTop(timeInSecond, attenuated)
            } else {
                this.scrollView.scrollToLeft(timeInSecond, attenuated)
            }
        }
    }
    /** 通知给定的node刷新数据 */
    public notifyRefreshItem(target: Node) {
        EventHandler.emitEvents(this.refreshItemEvents, target, target.getSiblingIndex())
    }
    /** 获取节点索引 */
    public getSiblingIndex(node: Node) {
        return this._children.indexOf(node)
    }
    /** 自定义索引方法 这里不是通过实时修改节点索引的方法，只是模拟类似的功能，实际上并没有真正改变节点的实际顺序（优化项） */
    public setSiblingIndex(node: Node, index: number) {
        // 此方法时参考引擎原setSiblingIndex方法 去掉了修改节点索引位置的调用（item本身的zIndex没有任何变化）
        index = index !== -1 ? index : this._children.length - 1
        var oldIndex = this._children.indexOf(node)
        if (index !== oldIndex) {
            this._children.splice(oldIndex, 1)
            if (index < this._children.length) {
                this._children.splice(index, 0, node)
            }
            else {
                this._children.push(node)
            }
            /**
             * 这里区别于原方法 原方法是改变node节点顺序后发送Node.EventType.SIBLING_ORDER_CHANGED通知 这里不需要修改节点顺序
             * 这里发送一个自定义事件 模拟 SIBLING_ORDER_CHANGED 通知
             */
            this.node.emit(UIChangeBrotherEvnet)
        }
    }
    onLoad() {
        this.initlized()
    }
    /** 初始化 */
    private initlized() {
        if (this._isinited) return
        //固定content的锚点为中心
        this.node.getComponent(UITransform)?.setAnchorPoint(0.5, 0.5);
        this.node.getComponent(UITransform)?.setContentSize(this.viewSize) //将content的尺寸设置与view相同 （功能用于空列表时也可以下拉刷新和加载） 
        // 重写 this.node.getContentSize 方法 因为content的真实尺寸不会随着item的数量变化
        // this.node.getContentSize = this.getContentSize.bind(this)
        this.node.setPosition(Vec3.ZERO)
        this.column = this.column < 1 ? 1 : this.column // 一组item的数量 最少是1 也就是普通的水平/垂直 大于1就是Grid模式
        // 监听content位置变化 刷新header footer节点的相对位置
        this.node.on(Node.EventType.TRANSFORM_CHANGED, this.onChangePosition, this)
        this.scrollView.node.on(Node.EventType.SIZE_CHANGED, this.resetItemSize, this)
        this._isinited = true
    }
    onDestroy() {
        this.node.off(Node.EventType.TRANSFORM_CHANGED, this.onChangePosition, this)
        this.scrollView.node.off(Node.EventType.SIZE_CHANGED, this.resetItemSize, this)
    }
    private onChangePosition() {
        let flag = this.isScrollToFooter // this.isScrollToFooter = true 向下滑动 false 向上滑动
        if (this.headerToFooter) {
            flag ? this.footerToHeaderWatchChilds(flag) : this.headerToFooterWatchChilds(flag) // 倒序刷新
        } else {
            flag ? this.headerToFooterWatchChilds(flag) : this.footerToHeaderWatchChilds(flag) // 正序刷新
        }
        // 当item 由多到少 并且 当content的位置被重置到初始状态时 重新设置头部的item归位
        if (this.vertical && 0 == this.node.getPosition().y || this.horizontal && 0 == this.node.getPosition().x) {
            this.header.setPosition(this.getGroupHeader(this.header))
        }
    }
    public resetItemSize() {
        // 重新设置原始尺寸
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].getComponent(UISpuerItem)?.saveOriginSize()
        }
        // 改变头部位置
        let pos = this.getGroupHeader(this.header)
        if (this.vertical) {
            this.header.setPosition(v3(pos.x, this.header.getPosition().y));
        } else {
            this.header.setPosition(v3(this.header.getPosition().x, pos.y));
        }
        // 通知改变坐标事件
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].emit(Node.EventType.TRANSFORM_CHANGED)
        }
    }
    /** 获取缩放宽度 */
    private getScaleWidth(node: Node): number {
        let uit = node.getComponent(UITransform) ?? new UITransform();
        return uit.width * this.getUsedScaleValue(node.getScale().x)
    }
    /** 获取缩放高度 */
    private getScaleHeight(node: Node): number {
        let uit = node.getComponent(UITransform) ?? new UITransform();
        return uit.height * this.getUsedScaleValue(node.getScale().y)
    }
    /** 简单的浅拷贝 */
    private getTempChildren() {
        let list = []
        for (let i = 0; i < this._children.length; i++) {
            const child = this._children[i];
            list.push(child)
        }
        return list
    }
    /** 正序更新item */
    private headerToFooterWatchChilds(flag: any) {
        let children = this.getTempChildren()
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            child.getComponent(UISpuerItem)?.watchSelf(flag);
        }
    }
    /** 倒序更新item */
    private footerToHeaderWatchChilds(flag: any) {
        let children = this.getTempChildren()
        for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];
            child.getComponent(UISpuerItem)?.watchSelf(flag);
        }
    }
    /** 当数据增加、减少时 获取数据偏移 */
    private getDataOffset(value: number) {
        // 返回删除数据偏移 （比如当前最大数据值=10，新数据=9 返回-1）
        if (this.footer && this.footer.getSiblingIndex() + 1 >= value) {
            let offset = this.footer.getSiblingIndex() + 1 - value
            return offset == 0 ? 0 : -offset
        }
        // 返回增加数据偏移
        if (this._maxItemTotal == 0 || value < this._maxItemTotal || this._maxItemTotal < this._maxPrefabTotal) return 0 //比如当前最多允许创建10个item 当前显示5个 返回0
        if (this.isGroupFooter(this.footer)) return 0 //Grid模式 如果尾部的位置是在一组item中末尾的位置时 返回 0 
        return value - this._maxItemTotal
    }
    /** 
     * 当数据增加、减少时 获取节点偏移量 
     * 当前数据是这样的   增加1个     增加2个
     * 0,1,2,3           1,2,3         2,3
     * 4,5,6           4,5,6,7     4,5,6,7
     *                             8
    */
    private getReallyOffset(dataOffset: number) {
        if (!this.header) return 0
        let x, y;
        if (dataOffset > 0) { // 代表增加item 表格模式下 通过偏移头部来让下方填满 填满后停止偏移
            for (let i = 0; i < dataOffset; i++) {
                if (this.isGroupFooter(this.footer)) return i //返回真实的偏移量
                // 此时如果header 已经是一组item中最后一个时 向下位移 并 设置到一组item的起始位置   
                x = this.header.getPosition().x;
                y = this.header.getPosition().y;
                if (this.vertical) { // 垂直滑动时
                    if (this.isGroupFooter(this.header)) { // 当列表中第一个item正在一组item中末尾位置时
                        if (this.headerToFooter) {
                            y = this.getGroupBottomY(this.header, this.header)  //正序排列时 Y轴向下偏移（垂直排列时 一组item 头在左尾在右）
                        } else {
                            y = this.getGroupTopY(this.header, this.header) //倒序排列时 Y轴向上偏移（垂直排列时 一组item 头在左尾在右）
                        }
                        x = this.getGroupHeader(this.header).x // X轴向头部偏移
                    } else { // 第一个item没有在一组item中末尾的位置 只将第一个item向右偏移 (只偏移X轴)
                        x = this.getGroupRightX(this.header, this.header) // X轴向右偏移
                    }
                } else { // 水平滑动时
                    if (this.isGroupFooter(this.header)) {  // 当列表中第一个item正在一组item中末尾位置时
                        if (this.headerToFooter) {
                            x = this.getGroupRightX(this.header, this.header) //正序排列时 X轴向右偏移（水平排列时 一组item 头在上尾在下）
                        } else {
                            x = this.getGroupLeftX(this.header, this.header) //倒序排列时 X轴向左偏移（水平排列时 一组item 头在上尾在下）
                        }
                        y = this.getGroupHeader(this.header).y // Y轴向头部偏移
                    } else {  // 第一个item没有在一组item中末尾的位置 只将第一个item向下偏移 (只偏移Y轴)
                        y = this.getGroupBottomY(this.header, this.header) // Y轴向下偏移
                    }
                }
                this.header.setPosition(v3(x, y, 0))
            }
            return dataOffset
        }
        // 代表减少了item 计算偏移量 offset<0 【注意！这里的逻辑和上面正好相反
        for (let i = 0; i < Math.abs(dataOffset); i++) {
            if (this.vertical) {
                if (this.isGroupHeader(this.header)) {
                    x = this.getGroupFooter(this.header).x
                    if (this.headerToFooter) {
                        y = this.getGroupTopY(this.header, this.header)
                    } else {
                        y = this.getGroupBottomY(this.header, this.header)
                    }
                } else {
                    x = this.getGroupLeftX(this.header, this.header)
                    y = this.header.getPosition().y
                }
            } else {
                if (this.isGroupHeader(this.header)) {
                    y = this.getGroupFooter(this.header).y
                    if (this.headerToFooter) {
                        x = this.getGroupLeftX(this.header, this.header)
                    } else {
                        x = this.getGroupRightX(this.header, this.header)
                    }
                } else {
                    y = this.getGroupTopY(this.header, this.header)
                    x = this.header.getPosition().x
                }
            }
            this.header.setPosition(v3(x, y, 0))
        }
        this.scrollView.calculateBoundary()
        return dataOffset
    }
    /** 刷新所有item数据 根据当前item的 index 刷新 */
    private refreshItems(value: number, offset: number = 0) {
        if (!this.header) return
        let startIndex = this.header.getSiblingIndex() - 1 + offset // 获取头部item持有的index 加上 数据偏移来计算起始index 
        for (let i = 0; i < this._children.length; i++) {
            const child = this._children[i];
            startIndex++
            // 这里的判断用于无限循环滚动的逻辑 如果索引大于数据总数 索引归零
            if (startIndex > value - 1) {
                startIndex = 0
            } else if (startIndex < 0) { // 索引小于0 索引定位到数据尾部 保持首尾相连
                startIndex = value - 1
            }
            child.setSiblingIndex(startIndex)//设置当前索引
            this.notifyRefreshItem(child)
        }
    }
    /** 从头部到尾部重置数据 */
    private resetToHeader() {
        for (let i = 0; i < this._children.length; i++) {
            const child = this._children[i];
            child.setSiblingIndex(i)
            this.notifyRefreshItem(child)
        }
        if (!this.headerLoop && !this.footerLoop) {
            this.header?.setPosition(this.getGroupHeader(this.header))
        } else if (!this.scrollToHeaderOrFooter) {
            this.header?.setPosition(this.getGroupHeader(this.header))
        }
    }
    /** 从尾部到头部重置数据 */
    private resetToFooter() {
        let index = this._maxItemTotal
        for (let i = this._children.length - 1; i >= 0; i--) {
            var child = this._children[i]
            child.setSiblingIndex(--index)
            this.notifyRefreshItem(child)
        }
    }
    /** 删除多余的item */
    private removeChilds(value: number) {
        // 有多余的item 需要删除
        let length = this.node.children.length - value
        // 删除掉多余的item
        for (let i = 0; i < length; i++) {
            var child = this.footer
            this.remChild(child)
            child.destroy()
            this.node.removeChild(child)
        }
        if (!this.header) return
        // 将头部节点的位置重置到一组item的第一个位置
        let pos = this.getGroupHeader(this.header)
        if (this.vertical) {
            this.header.setPosition(v3(pos.x, this.header.getPosition().y, this.header.getPosition().z));
        } else {
            this.header.setPosition(v3(this.header.getPosition().x, pos.y, this.header.getPosition().z));
        }
    }
    /** 分帧创建item */
    private async asyncCreateItem(value: number) {
        this._gener?.return("")//取消上一次的分帧任务（如果任务正在执行）
        // 有多余的item 需要删除 不处理
        if (this.node.children.length > value) return this.removeChilds(value)
        // 已经固定item总数 不处理
        if (this._maxPrefabTotal > 0 && this._maxPrefabTotal == this.node.children.length) return
        // 开始分帧创建item
        let total = value - this.node.children.length //计算当前应该创建的总数
        this._gener = this.getGeneratorLength(total, () => {
            let child = instantiate(this.prefab)
            child.setSiblingIndex(this.node.children.length)
            this.addChild(child)
            // 获取或添加 UISuperItem
            let spuerItem = child.getComponent(UISpuerItem) || child.addComponent(UISpuerItem)
            this.node.addChild(child)
            spuerItem.init(this)
            // item在首次创建时立即刷新 避免显示item初始状态
            this.notifyRefreshItem(child)
            // 如果创建的是第一个item 设置他的起始位置 之后的item会自动相对于他来设置自己 我们只需要确定第一个位置就行了
            if (this.node.children.length == 1) {
                let pos = this.getGroupHeader(this.header) //获取一组item中头部位置
                this.header.setPosition(pos)
                /**
                 * 利用cc.ScrollView的方法来设置content的起始位置 由于content在初始化的时候固定了锚点都为0.5 所以这里必然是坐标0 
                 * 如果你没有其他需求确定用0.5锚点的话 这里可以自己设置为Vec2.ZERO 节省不必要的计算（实际上计算量可忽略不计）
                 */
                this.scrollView.calculateBoundary()
            }
            let selfHorW, viewHorW
            if (this.vertical) {
                selfHorW = this.getReallySize().height
                viewHorW = this.viewSize.height
            } else {
                selfHorW = this.getReallySize().width
                viewHorW = this.viewSize.width
            }
            /**
             * 根据排列方向 来判断对比宽度还是高度
             * 这里使用参数this.multiple来判断是否需要继续创建 默认为2倍 比如view可视尺寸为800 2倍就是1600
             * 根据之前所创建的所有item的尺寸计算是否满足这个尺寸 如果满足则不再继续创建 
             * 由于是分帧加载 所以下一次创建会等这一次的返回结果 返回false 则终止分帧任务
             */
            if (selfHorW >= viewHorW * this.multiple && this.isGroupFooter(this.footer)) {
                this._maxPrefabTotal = this.node.children.length //固定item数量 不在继续创建
                return false
            }
            return true
        })
        await this.exeGenerator(this._gener, 10) //执行分帧任务 1帧创建10个
    }
    /** 同步添加本地变量 children 并发送 UIChangeBrotherEvnet 通知*/
    private addChild(node: Node) {
        this._children.push(node)
        this.node.emit(UIChangeBrotherEvnet)
    }
    /** 同步移除本地变量 children 并发送 UIChangeBrotherEvnet 通知 */
    private remChild(node: Node) {
        let index = this._children.indexOf(node)
        if (index == -1) return
        this._children.splice(index, 1)
        this.node.emit(UIChangeBrotherEvnet)
    }
    /** 分帧加载 */
    private * getGeneratorLength(length: number, callback: Function, ...params: any): Generator {
        for (let i = 0; i < length; i++) {
            let result = callback(i, ...params)
            if (result) {
                yield
            } else {
                return
            }
        }
    }
    /** 分帧执行 */
    private exeGenerator(generator: Generator, duration: number) {
        return new Promise((resolve, reject) => {
            let gen = generator
            let execute = () => {
                let startTime = new Date().getTime()
                for (let iter = gen.next(); ; iter = gen.next()) {
                    if (iter == null || iter.done) {
                        resolve(null)
                        return
                    }
                    if (new Date().getTime() - startTime > duration) {
                        setTimeout(() => execute(), director.getDeltaTime() * 1000)
                        return
                    }
                }
            }
            execute()
        })
    }
}
