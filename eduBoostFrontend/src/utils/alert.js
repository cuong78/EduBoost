
import swal from 'sweetalert';

/**
 * Show alert
 * @param {string} title - Alert title
 * @param {"success"|"error"|"warning"} icon - Alert icon
 * @returns {Promise}
 */
export const Alert = (title, icon) => {
    return swal(title, { icon });
};

export const showCancelConfirm = () => {
    return Alert("Hủy thao tác thành công", "success");
}

/**
 * Show confirmation dialog for delete action
 * @param {string} title - Dialog title
 * @param {string} text - Dialog text
 * @returns {Promise}
 */
export const showConfirmDelete = (title, text) => {
    return swal({
        title,
        text,
        icon: "warning",
        buttons: {
            cancel: {text: "Hủy", visible: true, closeModal: true},
            confirm: {text: "Xóa", visible: true, closeModal: true},
        },
        dangerMode: true,
    });
};

/**
 * Show confirmation dialog for restore action
 * @param {string} title - Dialog title
 * @param {string} text - Dialog text
 * @returns {Promise}
 */
export const showConfirmRestore = (title, text) => {
    return swal({
        title,
        text,
        icon: "warning",
        buttons: {
            cancel: {text: "Hủy", visible: true, closeModal: true},
            confirm: {text: "Xác nhận", visible: true, closeModal: true},
        },
    });
};


