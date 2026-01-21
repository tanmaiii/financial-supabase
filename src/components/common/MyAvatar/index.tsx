import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MyAvatarProps {
  users: {
    imageUrl: string;
    fullName: string;
  }[];
}

export default function MyAvatar({ users }: MyAvatarProps) {
  return (
    <>
      {/* <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale"> */}
      {users.map(
        ({ imageUrl, fullName }: { imageUrl: string; fullName: string }) => (
          <div className="flex flex-row gap-1 items-center" key={fullName}>
            <Avatar className="h-5 w-5">
              <AvatarImage src={imageUrl} alt={fullName} />
              <AvatarFallback className="text-xs">
                {fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {users.length === 1 && <span className="text-xs text-amber-600">{fullName}</span>}
          </div>
        )
      )}
      {/* </div> */}
    </>
  );
}
