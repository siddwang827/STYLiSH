window.onload = () => {
    let orderID = localStorage.getItem('order')
    if (!orderID) {
        return window.location.href = "/"
    }
    document.querySelector('.order_msg').innerHTML = `感謝您的購買<br>本次交易訂單編號<br>${orderID}`
    localStorage.removeItem('order')

}