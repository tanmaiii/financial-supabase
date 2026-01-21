'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PATHS } from "@/constants/path";
import { Calendar, Eye } from "lucide-react";
import { useRouter } from "@/i18n/routing";

interface CardScheduleProps {
  trip: ITrip;
}

export default function CardSchedule({ trip }: CardScheduleProps) {
  const router = useRouter();
  return (
    <Card
      onClick={() => router.push(PATHS.SCHEDULE_DETAIL(trip.uid))}
      className="hover:shadow-lg transition-shadow duration-300 gap-2 cursor-pointer"
    >
      <CardHeader>
        <CardTitle className="text-xl font-bold">{trip.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 mt-2">
          <Eye className="w-4 h-4" />
          <span className="text-sm">{trip.visibility}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 mb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {trip.description}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span>
            {trip.start_date} - {trip.end_date}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between flex-wrap items-center gap-2">
        <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage
              src="https://github.com/maxleiter.png"
              alt="@maxleiter"
            />
            <AvatarFallback>LR</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage
              src="https://github.com/evilrabbit.png"
              alt="@evilrabbit"
            />
            <AvatarFallback>ER</AvatarFallback>
          </Avatar>
        </div>
      </CardFooter>
    </Card>
  );
}
