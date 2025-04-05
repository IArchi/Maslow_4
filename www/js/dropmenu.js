function clear_drop_menu(event) {
    const item = get_parent_by_class(event.target, "dropdownselect");
    let ignore_id = "-1";
    if (item !== null && typeof item.id !== 'undefined') {
        ignore_id = item.id;
    }
    const list = elemsByClass("dropmenu-content");
    for (let index = 0; index < list.length; index++) {
        const item2 = get_parent_by_class(list[index], "dropdownselect");
        if (item2 !== null && typeof item2.id !== 'undefined' && item2.id !== ignore_id && list[index].classList.contains('show')) {
            list[index].classList.remove('show');
        }
    }
}

function get_parent_by_class(item, classname) {
    if (item === null || typeof item === 'undefined') return null;
    if (item.classList.contains(classname)) {
        return item;
    }
    return get_parent_by_class(item.parentElement, classname);
}
