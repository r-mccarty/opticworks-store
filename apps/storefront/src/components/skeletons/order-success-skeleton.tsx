import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card'
  import { Skeleton } from '@/components/ui/skeleton'

  export function OrderSuccessSkeleton() {
    return (
      <div className="min-h-screen bg-gray-50 pt-40 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-6 w-96" />
            </div>
          </div>

          {/* Order Details Skeleton */}
          <Card className="my-8">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-8 w-40" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-64" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>

          {/* Help Information Skeleton */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <Skeleton className="h-6 w-32 mx-auto mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    )
  }
