import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export const checkUser = async () => {
  const user = await currentUser();
  const clerk = await clerkClient();

  if (!user) {
    return null;
  }
  //   console.log('DB object:', !!db);
  // console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  try {
    const loggedInUser = await db?.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

      console.log('DB object:', !!db);
      console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    const name = `${user.firstName} ${user.lastName}`;

    clerk.users.updateUser(user.id, {
      username: name.split(" ").join("-") + user.id.slice(-4),
    });

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        image: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        username: name.split(" ").join("-") + user.id.slice(-4),
      },
    });

    return newUser;
  } catch (error) {
    console.log(error);
  }
};