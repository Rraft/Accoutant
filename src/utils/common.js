/**
 * @description 警告栏显示封装
 */
export function showWarn(vm, msg, refName = "warn") {
    vm.warnText = msg;
    const el = vm.$refs[refName];
    if (!el) return;
    el.style.display = "flex";
    el.style.animation = "fadeOut 2s ease both";
    setTimeout(() => alertInit(el), 2000);
}

/**
 * @description 重置警告栏
 */
export function alertInit(el) {
    el.style.display = "none";
    el.style.animation = "none";
}

/**
 * @description 深拷贝
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * @description 通用分页计算
 */
export function computePagination(total, pageSize = 10) {
    const rows = Math.ceil(total / pageSize);
    const leftRow = 0;
    const rightRow = Math.min(rows, 9);
    return { rows, leftRow, rightRow };
}
