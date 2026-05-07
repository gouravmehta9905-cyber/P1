package com.robms.config;

import com.robms.model.MenuItem;
import com.robms.model.TableEntity;
import com.robms.repository.MenuItemRepository;
import com.robms.repository.TableRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(TableRepository tableRepository, MenuItemRepository menuItemRepository) {
        return args -> {
            seedTable(tableRepository, "Table 1", 4);
            seedTable(tableRepository, "Table 2", 4);
            seedTable(tableRepository, "Table 3", 6);
            seedTable(tableRepository, "Table 4", 2);
            seedTable(tableRepository, "Table 5", 4);
            seedTable(tableRepository, "Table 6", 8);
            seedTable(tableRepository, "Table 7", 2);
            seedTable(tableRepository, "Table 8", 4);
            seedTable(tableRepository, "Table 9", 6);
            seedTable(tableRepository, "Table 10", 4);
            seedTable(tableRepository, "Table 11", 2);
            seedTable(tableRepository, "Table 12", 10);

            seedMenuItem(menuItemRepository, "Coca Cola", "Beverages", "203.59");
            seedMenuItem(menuItemRepository, "Fanta", "Beverages", "203.59");
            seedMenuItem(menuItemRepository, "Cola", "Beverages", "203.59");
            seedMenuItem(menuItemRepository, "Lemon Soda", "Beverages", "204.20");
            seedMenuItem(menuItemRepository, "Ice Coffee", "Beverages", "208.39");
            seedMenuItem(menuItemRepository, "Cold Tea", "Beverages", "203.59");
            seedMenuItem(menuItemRepository, "Oreo Shake", "Beverages", "210.79");

            seedMenuItem(menuItemRepository, "Fried Rice", "Main Course", "223.99");
            seedMenuItem(menuItemRepository, "Jeera Rice", "Main Course", "220.39");
            seedMenuItem(menuItemRepository, "Veg Rice", "Main Course", "219.19");
            seedMenuItem(menuItemRepository, "Butter Roti", "Main Course", "205.99");
            seedMenuItem(menuItemRepository, "Naan", "Main Course", "207.19");
            seedMenuItem(menuItemRepository, "Garlic Naan", "Main Course", "209.59");
            seedMenuItem(menuItemRepository, "Paneer Butter Masala", "Main Course", "226.39");
            seedMenuItem(menuItemRepository, "Chicken Curry", "Main Course", "227.59");
            seedMenuItem(menuItemRepository, "Dal Fry", "Main Course", "220.39");

            seedMenuItem(menuItemRepository, "French Fries", "Snacks", "205.99");
            seedMenuItem(menuItemRepository, "Burger", "Snacks", "217.99");
            seedMenuItem(menuItemRepository, "Sandwich", "Snacks", "216.79");

            seedMenuItem(menuItemRepository, "Ice Cream", "Desserts", "208.39");
            seedMenuItem(menuItemRepository, "Brownie", "Desserts", "211.99");
            seedMenuItem(menuItemRepository, "Gulab Jamun", "Desserts", "210.79");
        };
    }

    private void seedMenuItem(MenuItemRepository menuItemRepository, String name, String category, String price) {
        boolean exists = menuItemRepository.findAll().stream()
                .anyMatch(item -> item.getName().equalsIgnoreCase(name));
        if (!exists) {
            MenuItem item = new MenuItem();
            item.setName(name);
            item.setCategory(category);
            item.setPrice(new java.math.BigDecimal(price));
            item.setAvailable(true);
            menuItemRepository.save(item);
        }
    }

    private void seedTable(TableRepository tableRepository, String name, int capacity) {
        tableRepository.findByName(name)
                .orElseGet(() -> tableRepository.save(new TableEntity(name, "available", capacity)));
    }
}
