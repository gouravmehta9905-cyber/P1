package com.robms.controller;

import com.robms.model.MenuItem;
import com.robms.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    @Autowired
    private MenuItemRepository menuRepository;

    @GetMapping
    public List<MenuItem> getAllMenuItems() {
        return menuRepository.findAll();
    }

    @GetMapping("/available")
    public List<MenuItem> getAvailableMenuItems() {
        return menuRepository.findByAvailableTrue();
    }

    @PostMapping
    public MenuItem createMenuItem(@RequestBody MenuItem item) {
        return menuRepository.save(item);
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<MenuItem> updateAvailability(@PathVariable Long id, @RequestParam boolean available) {
        return menuRepository.findById(id)
                .map(item -> {
                    item.setAvailable(available);
                    return ResponseEntity.ok(menuRepository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
