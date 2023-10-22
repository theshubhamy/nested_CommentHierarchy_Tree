// controllers/UserController.js
import { User, Referral } from "./model/index.js";
app.post("/createUser", async (req, res) => {
  try {
    const { username, email, referrerId } = req.body;

    const user = await User.create({ username, email });

    if (referrerId) {
      const referrer = await User.findByPk(referrerId);

      if (referrer) {
        const referral = await Referral.create({
          referrerId: referrer.id,
          referredId: user.id,
        });
      } else {
        return res.status(400).json({ message: "Referrer not found" });
      }
    }

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/usersList", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: "Referred",
          through: {
            attributes: [],
          },
          include: [
            {
              model: User,
              as: "Referred",
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
