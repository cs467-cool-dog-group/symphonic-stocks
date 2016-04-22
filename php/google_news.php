
<?php
if(isset($_POST['company'])) {
    $company = $_POST['company'];
    $stock_date = $_POST['stock_date'];
?>
	<script>
    company = '<?php echo $company;?>';
    stock_date = '<?php echo $stock_date;?>';
    </script>
    <?php
    die();
    
}
?>