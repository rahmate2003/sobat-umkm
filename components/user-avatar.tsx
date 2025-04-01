import type { User } from "@/lib/api/user-service"
import Image from "next/image"

interface UserAvatarProps {
  user: User
  size?: number
}

export function UserAvatar({ user, size = 40 }: UserAvatarProps) {
  if (user.imageUrl) {
    return (
      <Image
        src={"/placeholder.svg"}
        alt={user.name}
        width={size}
        height={size}
        className="rounded-full"
      />
    )
  }

  // If no image, show first letter of name
  return (
    <div
      className="bg-primary flex items-center justify-center text-white rounded-full"
      style={{ width: size, height: size }}
    >
      <span>{user.name.charAt(0).toUpperCase()}</span>
    </div>
  )
}

