const finalAmount = Number(document.body.dataset.final);

const spinner = document.getElementById("admin-spinner");



document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("place-order-btn").addEventListener("click", async () => {

        
        

        const address = document.querySelector('input[name="address"]:checked');
        const payment = document.querySelector('input[name="payment"]:checked');

        if (!address) {
            triggerToast("Please select a delivery address", "error");
            return;
        }

        if (!payment) {
            triggerToast("Please select a payment method", "error");
            return;
        }

        spinner.style.display = "flex"

        const orderData = {
            addressId: address.value,
            paymentMethod: payment.value
        };

        try {
            const res = await fetch("/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();

            
            spinner.style.display = "none"


            if (!data.success) {
                triggerToast(data.message, "error");
                return;
            }


            if (payment.value !== "razorpay") {
                window.location.href = `/order-success/${data.orderId}`;
                return;
            }

            if(payment.value == "razorpay"){

                

                const paymentRes = await fetch("/razorpay", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({})
                });
                

                const paymentData = await paymentRes.json();

                const options = {
                    key: paymentData.key,
                    amount: paymentData.amount,
                    currency: "INR",
                    order_id: paymentData.razorpayOrderId,
                    name: "Quavix",
                    description: "Order Payment",

                    prefill: {
                        email: paymentData.email,
                        contact: paymentData.contact
                    },

                    handler: async function (response) {

                        
                        spinner.style.display = "flex"

                        const verifyRes = await fetch("/verify-razorpay",{
                            method:"POST",
                            headers:{
                                "Content-Type":"application/json"
                            },
                            body:JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            })
                        })

                        const verification = await verifyRes.json()


                        spinner.style.display = "none"

                        if(verification.success){
                            window.location.replace(`/order-success/${verification.orderId}`)
                        }else{
                            window.location.replace(`/payment-failed?amount=${finalAmount}`)
                        }

                    },

                    modal:{
                        ondismiss:function(){
                            window.location.replace(`/payment-failed?amount=${finalAmount}`)
                        }
                    }
                };

                const rzp = new Razorpay(options);
                rzp.open();

            }

            
        } catch (err) {

            console.error(err);
            window.location.href = "/not-found";

        }

    });

    function triggerToast(message, type = "error") {

        let toast = document.getElementById("toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            document.body.appendChild(toast);
        }

        toast.className = `toast ${type}`;
        toast.innerText = message;

        setTimeout(() => {
            toast.classList.add("show");
        }, 100);

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    const toast = document.getElementById("toast");

    if (toast) {
        setTimeout(() => {
        toast.classList.add("show");
        }, 100);

        setTimeout(() => {
        toast.classList.remove("show");
        }, 3000);
    }
})
async function applyCheckoutCoupon() {

    const select = document.getElementById('checkout-coupon-select')
    const couponCode = select.value

    if (!couponCode) {
        triggerToast('Please select a coupon first.', "error")
        return
    }

    const res = await fetch("/apply-coupon", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ couponCode })
    })

    const data = await res.json()

    if (!data.success) {
        triggerToast(data.message, "error")
        return
    }

    location.reload()

}

async function removeCheckoutCoupon() {

    const res = await fetch("/remove-coupon", {
        method: "POST"
    })

    const data = await res.json()

    if(data.success){
        location.reload()
    }

}