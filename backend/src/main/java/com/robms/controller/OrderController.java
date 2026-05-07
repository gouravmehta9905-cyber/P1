package com.robms.controller;

import com.robms.model.Order;
import com.robms.model.TableEntity;
import com.robms.repository.OrderRepository;
import com.robms.repository.TableRepository;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/active")
    public List<Order> getActiveOrders() {
        return orderRepository.findByStatusNotIn(List.of("billed", "cancelled"));
    }

    @GetMapping("/table/{tableId}/ready")
    public ResponseEntity<Order> getReadyOrderByTable(@PathVariable Long tableId) {
        return orderRepository.findFirstByTableIdAndStatusOrderByOrderTimeDesc(tableId, "ready")
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        if (order.getItems() != null) {
            BigDecimal total = order.getItems().stream()
                    .map(item -> item.getPriceAtOrderTime().multiply(new BigDecimal(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            order.setTotalAmount(total);
        }

        if (order.getTable() != null && order.getTable().getId() != null) {
            TableEntity table = tableRepository.findById(order.getTable().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Selected table does not exist"));
            BigDecimal currentBill = table.getCurrentBillAmount() == null
                    ? BigDecimal.ZERO
                    : table.getCurrentBillAmount();
            table.setStatus("occupied");
            table.setCurrentBillAmount(currentBill.add(order.getTotalAmount()));
            order.setTable(tableRepository.save(table));
        }

        // Link all items to this order to maintain bidirectional relationship
        if (order.getItems() != null) {
            order.getItems().forEach(item -> item.setOrder(order));
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // Broadcast the new order to all connected Kitchen Display Systems
        messagingTemplate.convertAndSend("/topic/orders", savedOrder);
        
        return savedOrder;
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return orderRepository.findById(id)
                .map(order -> {
                    order.setStatus(status);
                    Order updatedOrder = orderRepository.save(order);
                    
                    // When bill is settled, clear table's bill amount and mark as available
                    if ("billed".equals(status) && order.getTable() != null) {
                        TableEntity table = order.getTable();
                        table.setStatus("available");
                        table.setCurrentBillAmount(new java.math.BigDecimal("0"));
                        tableRepository.save(table);
                    }
                    
                    // Broadcast the status change (e.g. 'ready') back to the front desk
                    messagingTemplate.convertAndSend("/topic/orders", updatedOrder);
                    
                    return ResponseEntity.ok(updatedOrder);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
