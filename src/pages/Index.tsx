import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { FinanceWidget } from "@/components/dashboard/FinanceWidget";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import { MealPlanWidget } from "@/components/dashboard/MealPlanWidget";
import { InventoryAlertWidget } from "@/components/dashboard/InventoryAlertWidget";
import { FamilyWidget } from "@/components/dashboard/FamilyWidget";

const Index = () => {
  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-violet-600 to-purple-600 dark:from-primary dark:via-violet-700 dark:to-purple-700">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <GreetingHeader />
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="p-4 lg:p-8 max-w-7xl mx-auto mt-4">
        {/* Bento Grid Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Finance Widget */}
          <FinanceWidget />
          
          {/* Tasks Widget */}
          <TasksWidget />
          
          {/* Meal Plan Widget */}
          <MealPlanWidget />
          
          {/* Inventory Alerts */}
          <InventoryAlertWidget />
          
          {/* Family Widget */}
          <FamilyWidget />
        </div>
      </div>
    </div>
  );
};

export default Index;
