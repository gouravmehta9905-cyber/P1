package com.robms.controller;

import com.robms.model.TableEntity;
import com.robms.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    @Autowired
    private TableRepository tableRepository;

    @GetMapping
    public List<TableEntity> getAllTables() {
        return tableRepository.findAll();
    }

    @PostMapping
    public TableEntity createTable(@RequestBody TableEntity table) {
        return tableRepository.save(table);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TableEntity> updateTableStatus(@PathVariable Long id, @RequestParam String status) {
        return tableRepository.findById(id)
                .map(table -> {
                    table.setStatus(status);
                    return ResponseEntity.ok(tableRepository.save(table));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
