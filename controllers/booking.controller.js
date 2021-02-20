const stripe = require("stripe")(
  "sk_test_51IMOAIIAMKHowpZalkIzHJND1kaYy84zXSMi7j8lhm4b5UkAnoK81SZ951sSwOSVio7GygOWgvhJFuo3nKOxZ2Zy00e263c0wr"
);
const Tour = require("../model/tours.model");

module.exports.getCheckoutSession = async (req, res) => {
  try {
    //1] get the current booked tour
    const tour = await Tour.findById(req.params.tourId);

    //2] create checkout session

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      success_url: `${req.protocol}://${req.get("host")}/`,
      cancel_url: `${req.protocol}://${req.get("host")}/`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [`https://picsum.photos/536/354`], // load image from actual server
          amount: tour.price * 100,
          currency: "usd",
          quantity: 1,
        },
      ],
    });
    //3] create session response
    res.status(200).json({
      tour,
      session,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      error: error.message,
    });
  }
};
